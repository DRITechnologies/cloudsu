var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');

var chef_client = require('./chef_client.js');
var stacks_client = require('./stacks_client.js');
var template_client = require('./template_client.js');
var autoscale_client = require('./autoscale_client.js');
var elb_client = require('./elb_client.js');

var utls = require('../../utls/utilities.js');

function upgrade_client() {}

upgrade_client.prototype.init = function (params) {

    chef_client.init(params.cms);
    stacks_client.init(params.aws_account);
    autoscale_client.init(params.aws_account);
    elb_client.init(params.aws_account);

};

upgrade_client.prototype.run = function (params) {
    //determine upgrade type
    if (params.upgrade_type === 'Simple') {
        return this.simpleUpgrade(params);
    }
    return this.advancedUpgrade(params);

};

upgrade_client.prototype.rollback = function (params) {

    var env;
    var self = this;

    return chef_client.getEnvironment(params.stack_name)
        .then(function (environment) {
            env = environment;
            var update_list = env.default_attributes.concord_params.update_list;
            var last_update_list = env.default_attributes.concord_params.last_update_list;
            params.last_update_list = update_list;
            params.update_list = last_update_list;
            env.default_attributes.concord_params.update_list = last_update_list;
            env.default_attributes.rollback_available = false;
            return self.connectELB(params);
        })
        .then(function () {
            return chef_client.updateEnvironment(env);
        });
};

//perform simple upgrade
//switch version and kick cms
upgrade_client.prototype.simpleUpgrade = function (params) {

    var self = this;
    var env;

    return this.checkEnv(params)
        .then(function (environment) {
            env = environment;
            return self.updateEnvVersion(env, params);
        })
        .then(function () {
            return self.upgradedFinished(env);
        });

};

//perform advanced upgrade
//copy version to node level, switch env version, start new instances 
upgrade_client.prototype.advancedUpgrade = function (params) {

    var self = this;
    var env;

    return this.checkEnv(params)
        .then(function (environment) {
            env = environment;
            return self.upgradeStartSetup(env, params);
        })
        .then(function () {
            return self.lockNodes(env, params);
        })
        .then(function () {
            return self.updateEnvVersion(env, params);
        })
        .then(function () {
            return self.launchServers(env, params);
        })
        .then(function () {
            return stacks_client.waitForStack(params.stack_name, 20, 500);
        })
        .then(function () {
            return self.connectELBs(params);
        })
        .then(function () {
            return self.cleanup(params);
        })
        .then(function () {
            return self.upgradedFinished(env, params);
        });
};

upgrade_client.prototype.checkEnv = function (params) {

    var environment;

    return chef_client.getEnvironment(params.stack_name)
        .then(function (response) {
            environment = response;
            if (response.default_attributes.status !== 'READY' && !params.force_upgrade) {
                throw new Error('Environment is not in READY state');
            }
            return stacks_client.stackStatus(params.stack_name);
        })
        .then(function (status) {

            if (status.includes('PROGRESS')) {
                throw new Error('Stack in a PROGRESS state');
            }
            return;
        })
        .then(function () {
            var old_update_list = environment.default_attributes.concord_params.update_list;
            _.each(params.update_list, function (app) {
                var old_app = _.find(old_update_list, function (old) {
                    return old.app_name === app.app_name;
                });

                if (old_app.version === app.version) {
                    throw new Error('Update version is already live: ' + app.version);
                }
            });

            return environment;
        });

};

upgrade_client.prototype.upgradeStartSetup = function (environment, params) {
    var options = _.omit(_.clone(params), ['aws', 'cms', 'aws_account']);

    var concord_params = _.clone(environment.default_attributes.concord_params);
    params.last_update_list = _.clone(concord_params.update_list);
    params.last_environment = _.clone(environment);
    environment.default_attributes.concord_params = _.extend(concord_params, options);
    environment.default_attributes.status = 'UPGRADING';

    return chef_client.updateEnvironment(environment);
};

//lock parameters to node level
upgrade_client.prototype.lockNodes = function (environment, params) {

    var concord_params = environment.default_attributes.concord_params;

    return chef_client.getEnvironmentNodes(params.stack_name)
        .then(function (nodes) {
            //loop over each node in environment
            return Promise.map(nodes, function (node) {
                //get and update node
                return chef_client.getNode(node)
                    .then(function (node_body) {
                        node_body.normal.concord_params = concord_params;
                        return chef_client.updateNode(node_body);
                    });

            });

        });
};

upgrade_client.prototype.launchServers = function (environment, params) {

    var concord_params = environment.default_attributes.concord_params;
    var launch_params = _.extend(params, concord_params);

    return stacks_client.getTemplate(params.stack_name)
        .then(function (template) {
            return template_client.get(template, launch_params);
        })
        .then(function (template) {
            return stacks_client.updateStack(template, params.stack_name);
        });

};

upgrade_client.prototype.cleanup = function (params) {

    if (params.cleanup_type === 'Delete') {
        return this.removeOldServers(params);
    }
    return this.tagOldServers(params);
};

upgrade_client.prototype.removeOldServers = function (params) {

    return stacks_client.getTemplate(params.stack_name)
        .then(function (template_body) {
            var template = JSON.parse(template_body);
            return Promise.map(params.last_update_list, function (app) {
                    var service = utls.remove_non_alpha(_.clone(app));
                    var cf_name = service.app_name + service.version;
                    var omit_list = ['ASG' + cf_name,
                        'LC' + cf_name,
                        'CPUH' + cf_name,
                        'CPUL' + cf_name,
                        'SPD' + cf_name,
                        'SPU' + cf_name,
                        'WC' + cf_name
                    ];
                    template.Resources = _.omit(template.Resources, omit_list);
                    return;
                })
                .then(function () {
                    return stacks_client.updateStack(JSON.stringify(template), params.stack_name);
                });
        });
};

upgrade_client.prototype.tagOldServers = function (params) {

    var terminate_date = params.tag_date || moment().add(24, 'hours').format('YYYYMMDDHHmm');

    return stacks_client.stack(params.stack_name)
        .then(function (stack) {
            return Promise.map(params.last_update_list, function (app) {
                var service = utls.remove_non_alpha(_.clone(app));
                var as_name = 'ASG' + service.app_name + service.version;
                var as_group = _.find(stack.StackResources, function (x) {
                    return x.LogicalResourceId === as_name;
                });

                return autoscale_client.addTags(as_group, terminate_date);

            });
        });
};

upgrade_client.prototype.connectELBs = function (params) {

    return elb_client.connectElbs(params)
        .delay(15000)
        .then(function () {
            return elb_client.disconnectElbs(params);
        });

};

upgrade_client.prototype.upgradedFinished = function (environment, params) {
    if (params.cleanup_type === 'Tag') {
        environment.default_attributes.rollback_available = true;
    }
    environment.default_attributes.concord_params.last_update_list = params.last_update_list;
    environment.default_attributes.concord_params.upgrade_time = Math.round(+new Date() / 1000);
    environment.default_attributes.status = 'READY';
    return chef_client.updateEnvironment(environment);
};

upgrade_client.prototype.updateEnvVersion = function (environment, params) {

    environment.default_attributes.concord_params.app_version = params.app_version;
    environment.default_attributes.concord_params.last_upgrade_type = params.build_type;

    return chef_client.updateEnvironment(environment);

};

module.exports = new upgrade_client();