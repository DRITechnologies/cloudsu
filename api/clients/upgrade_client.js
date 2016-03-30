/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');

const chef_client = require('./chef_client.js');
const stacks_client = require('./stacks_client.js');
const template_client = require('./template_client.js');
const autoscale_client = require('./autoscale_client.js');
const elb_client = require('./elb_client.js');
const logger = require('../../utls/logger.js');

const utls = require('../../utls/utilities.js');

class UpgradeClient {
    constructor() {}

    init(params) {

        chef_client.init(params.cms);
        stacks_client.init(params.aws_account);
        autoscale_client.init(params.aws_account);
        elb_client.init(params.aws_account);

    }

    run(params) {
        //determine upgrade type
        if (params.upgrade_type === 'Simple') {
            logger.info('Simple upgrade initiated');
            return this.simpleUpgrade(params);
        }
        logger.info('Advanced upgrade initiated');
        return this.advancedUpgrade(params);

    }

    rollback(params) {

        let env;
        const self = this;

        return chef_client.getEnvironment(params.stack_name)
            .then(environment => {
                env = environment;
                params.update_list = env.default_attributes.concord_params.update_list;
                params.last_update_list = env.default_attributes.concord_params.last_update_list;
                env.default_attributes.concord_params.update_list = params.last_update_list;
                env.default_attributes.rollback_available = false;
                return self.connectELB(params);
            })
            .then(() => {
                return chef_client.updateEnvironment(env);
            });
    }

    simpleUpgrade(params) {

        const self = this;
        let env;

        return this.checkEnv(params)
            .then(environment => {
                env = environment;
                return self.updateEnvVersion(env, params);
            })
            .then(() => {
                return self.updateVersionTags(params);
            })
            .then(() => {
                return self.upgradeFinished(env, params);
            });

    }

    advancedUpgrade(params) {

        const self = this;
        let env;

        function verifyStack() {
            return stacks_client.waitForStack(params.stack_name, 20, 500)
                .then(() => {
                    if (params.elb) {
                        return self.connectELBs(params);
                    }
                })
                .then(() => {
                    return self.cleanup(params);
                })
                .then(() => {
                    return self.upgradeFinished(env, params);
                });
        }

        return this.checkEnv(params)
            .then(environment => {
                env = environment;
                return self.upgradeStartSetup(env, params);
            })
            .then(() => {
                return self.lockNodes(env, params);
            })
            .then(() => {
                return self.updateEnvVersion(env, params);
            })
            .then(() => {
                return self.launchServers(env, params);
            })
            .then(() => {
                verifyStack();
                return 'Sucessfully started upgrade';
            });

    }

    checkEnv(params) {

        let environment;

        return chef_client.getEnvironment(params.stack_name)
            .then(response => {
                environment = response;
                if (response.default_attributes.status !== 'READY' && !params.force_upgrade) {
                    throw new Error('Environment is not in READY state');
                }
                return stacks_client.stackStatus(params.stack_name);
            })
            .then(status => {
                //return if stack is already in a progress state
                if (status.includes('PROGRESS')) {
                    throw new Error(`Stack in a PROGRESS state: ${status}`);
                }
                return;
            })
            .then(() => {
                const old_update_list = environment.default_attributes.concord_params.update_list;
                _.each(params.update_list, app => {
                    const old_app = _.find(old_update_list, old => {
                        return old.app_name === app.app_name;
                    });

                    if (old_app.version === app.version) {
                        throw new Error(`Upgrade version is already live: ${app.version}`);
                    }
                });

                return environment;
            });

    }

    upgradeStartSetup(environment, params) {

        const options = _.omit(_.clone(params), ['aws', 'cms', 'aws_account']);

        let concord_params = _.clone(environment.default_attributes.concord_params);
        params.last_update_list = _.clone(concord_params.update_list);
        params.last_environment = _.clone(environment);
        environment.default_attributes.concord_params = _.extend(concord_params, options);
        environment.default_attributes.status = 'UPGRADING';

        return chef_client.updateEnvironment(environment);
    }

    lockNodes(environment, params) {
        let concord_params = environment.default_attributes.concord_params;

        return chef_client.getEnvironmentNodes(params.stack_name)
            .then(nodes => {
                //loop over each node in environment
                return Promise.map(nodes, node => {
                    //get and update node
                    return chef_client.getNode(node)
                        .then(node_body => {
                            node_body.normal.concord_params = concord_params;
                            return chef_client.updateNode(node_body);
                        });

                });

            });
    }

    launchServers(environment, params) {

        logger.info(`Launching servers for stack: ${params.stack_name}`);

        const concord_params = environment.default_attributes.concord_params;
        const launch_params = _.extend(_.clone(params), concord_params);

        return stacks_client.getTemplate(params.stack_name)
            .then(template => {
                return template_client.get(template, launch_params);
            })
            .then(template => {
                return stacks_client.updateStack(template, params.stack_name);
            });

    }

    cleanup(params) {

        logger.info(`Running cleanup job: ${params.stack_name}`);

        if (params.cleanup_type === 'Delete') {
            return this.removeOldServers(params);
        }
        return this.tagOldServers(params);
    }

    removeOldServers(params) {

        logger.info(`Removing old servers: ${params.stack_name}`);

        return stacks_client.getTemplate(params.stack_name)
            .then(template_body => {
                const template = JSON.parse(template_body);
                return Promise.map(params.last_update_list, app => {
                        const service = utls.remove_non_alpha(_.clone(app));
                        const cf_name = service.app_name + service.version;
                        const omit_list = [`ASG${cf_name}`,
                            `LC${cf_name}`,
                            `CPUH${cf_name}`,
                            `CPUL${cf_name}`,
                            `SPD${cf_name}`,
                            `SPU${cf_name}`,
                            `WC${cf_name}`
                        ];
                        template.Resources = _.omit(template.Resources, omit_list);
                        return;
                    })
                    .then(() => {
                        return stacks_client.updateStack(JSON.stringify(template), params.stack_name);
                    });
            });
    }

    tagOldServers(params) {

        const terminate_date = params.tag_date || moment().add(24, 'hours').format('YYYYMMDDHHmm');

        logger.info(`Tagging old servers with date: ${terminate_date}`);

        return stacks_client.stack(params.stack_name)
            .then(stack => {
                return Promise.map(params.last_update_list, app => {
                    const service = utls.remove_non_alpha(_.clone(app));
                    const as_name = `ASG${service.app_name}${service.version}`;
                    const as_group = _.find(stack.StackResources, x => {
                        return x.LogicalResourceId === as_name;
                    });

                    return autoscale_client.addTags(as_group, terminate_date);

                });
            });
    }

    connectELBs(params) {

        logger.info(`Connecting ELB's for stack: ${params.stack_name}`);

        //connect elb and wait 15 sec to disconnect old stack_name
        //this delay give the elb time to put those new servers inService
        return elb_client.connectElbs(params)
            .delay(15000)
            .then(() => {
                return elb_client.disconnectElbs(params);
            });

    }

    upgradeFinished(environment, params) {

        logger.info(`Finished upgrade for stack: ${params.stack_name}`);

        if (params.cleanup_type === 'Tag') {
            environment.default_attributes.rollback_available = true;
        }

        environment.default_attributes.concord_params.last_update_list = params.last_update_list;
        environment.default_attributes.concord_params.upgrade_time = Math.round(+new Date() / 1000);
        environment.default_attributes.status = 'READY';
        return chef_client.updateEnvironment(environment);
    }

    updateEnvVersion(environment, params) {

        logger.info(`Updating environment version: ${params.app_version} stack: ${params.stack_name}`);

        environment.default_attributes.concord_params.app_version = params.app_version;
        environment.default_attributes.concord_params.last_upgrade_type = params.build_type;

        return chef_client.updateEnvironment(environment);

    }

    updateVersionTags(params) {

        logger.info(`Updating tag version ${params.stack_name}`);

        return stacks_client.stack(params.stack_name)
            .then(stack => {
                const as_group = _.find(stack.StackResources, x => {
                    return x.ResourceType === 'AWS::AutoScaling::AutoScalingGroup';
                });
                return autoscale_client.addTags(as_group, 'version', params.app_version);
            });
    }
}

module.exports = new UpgradeClient();
