/*jshint esversion: 6 */
'use strict';

const fs = require('fs');
const _ = require('underscore');
const path = require('path');
const config = require('../../config/config.js');
const logger = require('../../utls/logger.js');
const secure = require('../../config/secure_config');

//clients
const ec2_client = require('./ec2_client.js');


// templates
const ASG = fs.readFileSync(path.resolve(__dirname, '../../templates/ASG/asgtemplate.json'), 'utf8');
const ELB = fs.readFileSync(path.resolve(__dirname, '../../templates/ELB/elbtemplate.json'), 'utf8');
const EC2 = fs.readFileSync(path.resolve(__dirname, '../../templates/EC2/ec2template.json'), 'utf8');
const LC = fs.readFileSync(path.resolve(__dirname, '../../templates/LaunchConfig/launchtemplate.json'), 'utf8');
const ROUTE_53 = fs.readFileSync(path.resolve(__dirname, '../../templates/Route53/Route53.json'), 'utf8');
const SHELL_TEMPLATE = fs.readFileSync(path.resolve(__dirname, '../../templates/Shell/shell.json'), 'utf8');
const WH = fs.readFileSync(path.resolve(__dirname, '../../templates/WH/wh.json'), 'utf8');
const WC = fs.readFileSync(path.resolve(__dirname, '../../templates/WC/wc.json'), 'utf8');
const USER_DATA = fs.readFileSync(path.resolve(__dirname, '../../templates/Scripts/userdata.json'), 'utf8');
const META_DATA = fs.readFileSync(path.resolve(__dirname, '../../templates/Scripts/metadata.json'), 'utf8');
const CPU_HIGH = fs.readFileSync(path.resolve(__dirname, '../../templates/CPU/high.json'), 'utf8');
const CPU_LOW = fs.readFileSync(path.resolve(__dirname, '../../templates/CPU/low.json'), 'utf8');
const SP_DOWN = fs.readFileSync(path.resolve(__dirname, '../../templates/ScalePolicy/ScaleDown.json'), 'utf8');
const SP_UP = fs.readFileSync(path.resolve(__dirname, '../../templates/ScalePolicy/ScaleUp.json'), 'utf8');
const BOOTSTRAP = fs.readFileSync(path.resolve(__dirname, '../../templates/Scripts/bootstrap.py'), 'utf8');

// utls
const utls = require('../../utls/utilities.js');


class ConstructTemplate {
    constructor () {}

    get (templateBody, params) {

        let template;

        if (templateBody) {
            template = JSON.parse(templateBody);
        } else {
            template = JSON.parse(SHELL_TEMPLATE);
        }
        const self = this;

        return this.sourceDefaults()
            .then(defaults => {

                if (params.build_size === 'Single') {
                    return self.get_single_template(template, params);
                }

                return self.get_ha_template(template, params, defaults);

            });

    }

    get_ha_template (template, params, defaults) {

        const self = this;
        const root_params = _.clone(params);
        const client_db = secure.get('db_client');

        return this.build_volumes(params)
            .then(volumes => {

                _.each(params.update_list, app => {

                    //combine defaults into flat json
                    let vars = _.defaults(_.clone(app), root_params, defaults);

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
                    vars.node_name = `${vars.stack_name}-${vars.app_name}`;
                    vars.wc_ref = `LC${vars.app_name}${vars.version}`;
                    vars.wh_name = `WH${vars.app_name}`;
                    vars.dns_ref = `ELB${vars.app_name}${vars.version}`;
                    vars.dns_type = 'DNSName';

                    //add client db creds
                    let bootstrap = _.template(BOOTSTRAP);
                    bootstrap = bootstrap(client_db);

                    // push asg params into template
                    let asg = _.template(ASG);
                    asg = JSON.parse(asg(vars));

                    // wc and wh
                    let lc = _.template(LC);
                    lc = JSON.parse(lc(vars));
                    let wc = _.template(WC);
                    wc = wc(vars);


                    // cpu
                    let cpu_high = _.template(CPU_HIGH);
                    cpu_high = cpu_high(vars);
                    let cpu_low = _.template(CPU_LOW);
                    cpu_low = cpu_low(vars);


                    // scale policies
                    let spu = _.template(SP_UP);
                    spu = spu(vars);
                    let spd = _.template(SP_DOWN);
                    spd = spd(vars);


                    let userdata = _.template(USER_DATA);
                    userdata = JSON.parse(userdata(vars));
                    lc.Properties.UserData = userdata;
                    let metadata = _.template(META_DATA);
                    metadata = JSON.parse(metadata(vars));
                    metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/first-boot.json'].content = vars.first_boot;
                    metadata['AWS::CloudFormation::Init']['chef_register']['files']['/tmp/bootstrap.py'].content = String(bootstrap);
                    lc.Metadata = metadata;
                    lc.Properties.BlockDeviceMappings = volumes;

                    if (vars.iam_role) {
                        lc.Properties.IamInstanceProfile = vars.iam_profile;
                    }


                    const suffix = vars.app_name + vars.version;

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
                    template.Resources[`ASG${suffix}`] = asg;
                    template.Resources[`LC${suffix}`] = lc;
                    // add cpu alerts to template
                    template.Resources[`CPUH${suffix}`] = JSON.parse(cpu_high);
                    template.Resources[`CPUL${suffix}`] = JSON.parse(cpu_low);
                    // add scale policy to template
                    template.Resources[`SPU${suffix}`] = JSON.parse(spu);
                    template.Resources[`SPD${suffix}`] = JSON.parse(spd);
                    // add wait condition to template
                    template.Resources[`WC${suffix}`] = JSON.parse(wc);

                    if (vars.type === 'create' || vars.type === 'add') {
                        // elb
                        vars.dns_ref = `ELB${vars.app_name}`;
                        let elb = _.template(ELB);
                        elb = JSON.parse(elb(vars));
                        elb.Properties.SecurityGroups = vars.elb_security_groups;

                        if (vars.multi_az) {
                            elb.Properties.CrossZone = true;
                            elb.Properties.AvailabilityZones = vars.regions;
                        } else {
                            elb.Properties.AvailabilityZones = vars.regions;
                        }

                        if (vars.ssl_cert) {
                            const https_config = {
                                LoadBalancerPort: '443',
                                InstanceProtocol: 'HTTPS',
                                InstancePort: '443',
                                Protocol: 'HTTPS',
                                SSLCertificateId: vars.ssl_cert
                            };
                            elb.Properties.Listeners.push(https_config);
                        }

                        template.Resources[`ELB${vars.app_name}`] = elb;
                        //add route 53 to template
                        if (params.route_53) {
                            // dns
                            let route_53 = _.template(ROUTE_53);
                            route_53 = route_53(vars);
                            template.Resources[`DNS${vars.app_name}`] = JSON.parse(route_53);
                        }

                        // add wait condition to template
                        template.Resources[vars.wh_name] = JSON.parse(WH);
                    }

                });
                return JSON.stringify(template);
            });

    }

    get_single_template (template, params) {

        const client_db = secure.get('db_client');
        //load templates
        const self = this;
        return this.build_volumes(params)
            .then(volumes => {
                let bootstrap = _.template(BOOTSTRAP);
                let wc = _.template(WC);
                let userdata = _.template(USER_DATA);
                let metadata = _.template(META_DATA);
                let route_53 = _.template(ROUTE_53);
                let ec2 = _.template(EC2);

                if (params.route_53) {
                    //dns
                    params.wc_ref = 'instance';
                    params.dns_type = 'PrivateDnsName';
                    params.dns = [params.stack_name, '.', params.domain].join('');
                    route_53 = route_53(params);
                    template.Resources[`DNS${params.wc_ref}`] = JSON.parse(route_53);
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

                //boot strap params
                bootstrap = bootstrap(client_db);

                // wc
                wc = wc(params);

                // add userdata
                userdata = JSON.parse(userdata(params));
                ec2.Properties.UserData = userdata;
                ec2.Properties.SecurityGroupIds = params.security_groups;

                // add metadata
                metadata = JSON.parse(metadata(params));
                metadata['AWS::CloudFormation::Init']['chef_register']['files']['/etc/chef/validation.pem'].content = params.cms_validator;
                metadata['AWS::CloudFormation::Init']['chef_register']['files']['/tmp/bootstrap.py'].content = String(bootstrap);
                ec2.Metadata = metadata;
                template.Resources[params.wc_ref] = ec2;

                // add wait condition to template
                template.Resources[params.wh_name] = JSON.parse(WH);
                template.Resources[`WC${params.wc_ref}`] = JSON.parse(wc);

                logger.info('addiing stack with resources:', _.keys(template.Resources));

                return JSON.stringify(template);

            });
    }

    get_first_boot (first_boot, app_name, dns, port) {

        first_boot.service_proxy.services[app_name] = {
            hostname: dns,
            port: port
        };

        return first_boot;

    }

    sourceDefaults () {

        return config.getAll()
            .then(defaults => {

                return {
                    ami: defaults.aws_default_ami,
                    instance_size: defaults.aws_default_instance_size,
                    min_size: 1,
                    max_size: 3,
                    port: '3000'
                };

            });
    }

    build_volumes (params) {

        return ec2_client.instanceStoreMap()
            .then(map => {
                const size = _.clone(params.instance_size).replace('.', '_');
                const ephemeral_disks = map[size];
                const BlockDeviceMappings = [];
                if (ephemeral_disks && params.instance_store) {
                    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
                    _.each(ephemeral_disks, (disk, index) => {

                        const character = alphabet[index];

                        BlockDeviceMappings.push({
                            DeviceName: `/dev/sd${character}`,
                            VirtualName: disk
                        });

                    });
                }
                return BlockDeviceMappings;
            })
            .then(BlockDeviceMappings => {

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
            .then(BlockDeviceMappings => {

                if (params.aditional_ebs) {
                    _.each(params.additional_ebs_volumes, (disk, index) => {
                        BlockDeviceMappings.push({
                            DeviceName: `/dev/sda${index}`,
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
    }
}

module.exports = new ConstructTemplate();
