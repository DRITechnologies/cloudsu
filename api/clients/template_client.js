var fs = require('fs');
var _ = require('underscore');
var path = require('path');

//Load default configs
var config = require('../../config/config.js');

var logger = require('../../utls/logger.js');

//clients
var ec2_client = require('./ec2_client.js');


// templates
var ASG = fs.readFileSync(path.resolve(__dirname, '../../templates/ASG/asgtemplate.json'), 'utf8');
var ELB = fs.readFileSync(path.resolve(__dirname, '../../templates/ELB/elbtemplate.json'), 'utf8');
var EC2 = fs.readFileSync(path.resolve(__dirname, '../../templates/EC2/ec2template.json'), 'utf8');
var LC = fs.readFileSync(path.resolve(__dirname, '../../templates/LaunchConfig/launchtemplate.json'), 'utf8');
var ROUTE_53 = fs.readFileSync(path.resolve(__dirname, '../../templates/Route53/Route53.json'), 'utf8');
var SHELL_TEMPLATE = fs.readFileSync(path.resolve(__dirname, '../../templates/Shell/shell.json'), 'utf8');
var WH = fs.readFileSync(path.resolve(__dirname, '../../templates/WH/wh.json'), 'utf8');
var WC = fs.readFileSync(path.resolve(__dirname, '../../templates/WC/wc.json'), 'utf8');
var USER_DATA = fs.readFileSync(path.resolve(__dirname, '../../templates/Scripts/userdata.json'), 'utf8');
var META_DATA = fs.readFileSync(path.resolve(__dirname, '../../templates/Scripts/metadata.json'), 'utf8');
var CPU_HIGH = fs.readFileSync(path.resolve(__dirname, '../../templates/CPU/high.json'), 'utf8');
var CPU_LOW = fs.readFileSync(path.resolve(__dirname, '../../templates/CPU/low.json'), 'utf8');
var SP_DOWN = fs.readFileSync(path.resolve(__dirname, '../../templates/ScalePolicy/ScaleDown.json'), 'utf8');
var SP_UP = fs.readFileSync(path.resolve(__dirname, '../../templates/ScalePolicy/ScaleUp.json'), 'utf8');

// utls
var utls = require('../../utls/utilities.js');


function construct_template() {}


construct_template.prototype.get = function (templateBody, params) {
    
    var template;

    if (templateBody) {
        template = JSON.parse(templateBody);
    } else {
        template = JSON.parse(SHELL_TEMPLATE);
    }
    var self = this;

    return this.sourceDefaults()
        .then(function (defaults) {

            //XXX temporary to get chef checkin
            params.cms_url = params.cms.url;
            params.cms_key = params.cms.key;
            params.cms_validator = params.cms.validator;

            if (params.build_size === 'Single') {
                return self.get_single_template(template, params);
            }

            return self.get_ha_template(template, params, defaults);

        });

};

construct_template.prototype.get_ha_template = function (template, params, defaults) {

    var self = this;
    var root_params = _.clone(params);

    return this.build_volumes(params)
        .then(function (volumes) {

            _.each(params.update_list, function (app) {

                //combine defaults into flat json
                var vars = _.defaults(_.clone(app), root_params, defaults);

                //dns
                vars.dns = [vars.stack_name, '-', vars.app_name, '.', vars.domain].join('');

                //Setup nginx proxy
                vars.first_boot = {
                    service_proxy: {
                        name: 'serviceProxy',
                        services: {}
                    }
                };

                vars.first_boot = self.get_first_boot(vars.first_boot, vars.app_name, vars.dns, vars.port);

                // cleanup names
                vars = utls.remove_non_alpha(vars);

                // set wait handle callback
                vars.node_name = vars.stack_name + '-' + vars.app_name;
                vars.wc_ref = 'LC' + vars.app_name + vars.version;
                vars.wh_name = 'WH' + vars.app_name;
                vars.dns_ref = 'ELB' + vars.app_name + vars.version;
                vars.dns_type = 'DNSName';

                // input the params into template
                var asg = _.template(ASG);
                asg = JSON.parse(asg(vars));

                // wc and wh
                var lc = _.template(LC);
                lc = JSON.parse(lc(vars));
                var wc = _.template(WC);
                wc = wc(vars);


                // cpu
                var cpu_high = _.template(CPU_HIGH);
                cpu_high = cpu_high(vars);
                var cpu_low = _.template(CPU_LOW);
                cpu_low = cpu_low(vars);


                // scale policies
                var spu = _.template(SP_UP);
                spu = spu(vars);
                var spd = _.template(SP_DOWN);
                spd = spd(vars);


                var userdata = _.template(USER_DATA);
                userdata = JSON.parse(userdata(vars));
                lc.Properties.UserData = userdata;
                var metadata = _.template(META_DATA);
                metadata = JSON.parse(metadata(vars));
                metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/validation.pem'].content = vars.cms_validator;
                metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/first-boot.json'].content = vars.first_boot;
                lc.Metadata = metadata;
                lc.Properties.BlockDeviceMappings = volumes;

                if (vars.iam_role) {
                    lc.Properties.IamInstanceProfile = vars.iam_profile;
                }


                var suffix = vars.app_name + vars.version;

                if (vars.desired_size) {
                    asg.Properties.DesiredCapacity = vars.desired_size;
                }

                lc.Properties.SecurityGroups = vars.security_groups;
                if (vars.multi_az) {
                    asg.Properties.AvailabilityZones = vars.regions;
                } else {
                    asg.Properties.AvailabilityZones = vars.regions;
                }

                //add sns topic
                asg.Properties.NotificationConfigurations = [{
                    TopicARN: vars.aws.topic_arn,
                    NotificationTypes: [
                        'autoscaling:EC2_INSTANCE_LAUNCH',
                        'autoscaling:EC2_INSTANCE_TERMINATE'
                    ]
                }];


                // add auto scale group and launch config to template
                template.Resources['ASG' + suffix] = asg;
                template.Resources['LC' + suffix] = lc;
                // add cpu alerts to template
                template.Resources['CPUH' + suffix] = JSON.parse(cpu_high);
                template.Resources['CPUL' + suffix] = JSON.parse(cpu_low);
                // add scale policy to template
                template.Resources['SPU' + suffix] = JSON.parse(spu);
                template.Resources['SPD' + suffix] = JSON.parse(spd);
                // add wait condition to template
                template.Resources['WC' + suffix] = JSON.parse(wc);

                if (vars.type === 'create' || vars.type === 'add') {
                    // elb
                    vars.dns_ref = 'ELB' + vars.app_name;
                    var elb = _.template(ELB);
                    elb = JSON.parse(elb(vars));
                    elb.Properties.SecurityGroups = vars.elb_security_groups;

                    if (vars.multi_az) {
                        elb.Properties.CrossZone = true;
                        elb.Properties.AvailabilityZones = vars.regions;
                    } else {
                        elb.Properties.AvailabilityZones = vars.regions;
                    }

                    if (vars.ssl_cert) {
                        var https_config = {
                            LoadBalancerPort: '443',
                            InstanceProtocol: 'HTTPS',
                            InstancePort: '443',
                            Protocol: 'HTTPS',
                            SSLCertificateId: vars.ssl_cert
                        };
                        elb.Properties.Listeners.push(https_config);
                    }

                    template.Resources['ELB' + vars.app_name] = elb;
                    //add route 53 to template
                    if (params.route_53) {
                        // dns
                        var route_53 = _.template(ROUTE_53);
                        route_53 = route_53(vars);
                        template.Resources['DNS' + vars.app_name] = JSON.parse(route_53);
                    }

                    // add wait condition to template
                    template.Resources[vars.wh_name] = JSON.parse(WH);
                }

            });
            return JSON.stringify(template);
        });

};

construct_template.prototype.get_single_template = function (template, params) {

    //load templates
    var self = this;
    return this.build_volumes(params)
        .then(function (volumes) {
            var wc = _.template(WC);
            var userdata = _.template(USER_DATA);
            var metadata = _.template(META_DATA);
            var route_53 = _.template(ROUTE_53);
            var ec2 = _.template(EC2);

            if (params.route_53) {
                //dns
                params.wc_ref = 'instance';
                params.dns_type = 'PrivateDnsName';
                params.dns = [params.stack_name, '.', params.domain].join('');
                route_53 = route_53(params);
                template.Resources['DNS' + params.wc_ref] = JSON.parse(route_53);
            }

            params.node_name = params.stack_name;

            params.wc_ref = 'instance';
            params.dns_ref = 'instance';
            params.wh_name = ['WH', params.wc_ref].join('');
            params.first_boot = {};

            params.first_boot = {
                service_proxy: {
                    name: 'serviceProxy',
                    services: {}
                }
            };

            params.first_boot = self.get_first_boot(params.first_boot, params.app_name, params.dns, params.port);
            ec2 = JSON.parse(ec2(params));
            ec2.Properties.AvailabilityZone = _.first(params.regions);
            ec2.Properties.BlockDeviceMappings = volumes;

            if (params.iam_profile) {
                ec2.Properties.IamInstanceProfile = params.iam_profile;
            }

            // wc
            wc = wc(params);

            // add userdata
            userdata = JSON.parse(userdata(params));
            ec2.Properties.UserData = userdata;
            ec2.Properties.SecurityGroupIds = params.security_groups;

            // add metadata
            metadata = JSON.parse(metadata(params));
            metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/validation.pem'].content = params.cms_validator;
            metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/first-boot.json'].content = params.first_boot;
            ec2.Metadata = metadata;
            template.Resources[params.wc_ref] = ec2;

            // add wait condition to template
            template.Resources[params.wh_name] = JSON.parse(WH);
            template.Resources['WC' + params.wc_ref] = JSON.parse(wc);

            logger.info('addiing stack with resources:', _.keys(template.Resources));

            return JSON.stringify(template);

        });
};


construct_template.prototype.get_first_boot = function (first_boot, app_name, dns, port) {

    first_boot.service_proxy.services[app_name] = {
        hostname: dns,
        port: port
    };

    return first_boot;

};


construct_template.prototype.sourceDefaults = function () {

    return config.getAll()
        .then(function (defaults) {

            return {
                ami: defaults['aws_default_ami'],
                instance_size: defaults['aws_default_instance_size'],
                min_size: 1,
                max_size: 3,
                port: '3000'
            };

        });
};

construct_template.prototype.build_volumes = function (params) {

    return ec2_client.instanceStoreMap()
        .then(function (map) {
            var size = _.clone(params.instance_size).replace('.', '_');
            var ephemeral_disks = map[size];
            var BlockDeviceMappings = [];
            if (ephemeral_disks && params.instance_store) {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz';
                _.each(ephemeral_disks, function (disk, index) {

                    var character = alphabet[index];

                    BlockDeviceMappings.push({
                        DeviceName: '/dev/sd' + character,
                        VirtualName: disk
                    });

                });
            }
            return BlockDeviceMappings;
        })
        .then(function (BlockDeviceMappings) {

            if (params.ebs_root_volume) {
                BlockDeviceMappings.push({
                    DeviceName: '/dev/xvda',
                    Ebs: {
                        VolumeSize: params.ebs_root_size,
                        VolumeType: 'gp2',
                        DeleteOnTermination: true
                    }
                });
            }

            return BlockDeviceMappings;
        })
        .then(function (BlockDeviceMappings) {

            if (params.aditional_ebs) {
                _.each(params.additional_ebs_volumes, function (disk, index) {
                    BlockDeviceMappings.push({
                        DeviceName: '/dev/sda' + index,
                        Ebs: {
                            VolumeSize: disk.size,
                            VolumeType: 'gp2',
                            DeleteOnTermination: true
                        }
                    });
                });
            }

            return BlockDeviceMappings;
        });
};

module.exports = new construct_template();