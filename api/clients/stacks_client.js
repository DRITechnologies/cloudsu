var Promise = require('bluebird');
var AWS = require('aws-sdk');
var _ = require('underscore');
var retry = require('bluebird-retry');

//logger
var logger = require('../../utls/logger.js');

//utls
var utls = require('../../utls/utilities.js');

//clients
var template_client = require('./template_client.js');
var elb_client = require('./elb_client.js');


function stacks_client() {}

stacks_client.prototype.init = function (account) {

    this.cloudformation = Promise.promisifyAll(new AWS.CloudFormation(account));
    elb_client.init(account);
};

stacks_client.prototype.listStacks = function () {
    logger.info('getting list of stacks');
    return this.cloudformation.listStacksAsync({
        StackStatusFilter: [
            'CREATE_IN_PROGRESS',
            'CREATE_FAILED',
            'CREATE_COMPLETE',
            'ROLLBACK_IN_PROGRESS',
            'ROLLBACK_FAILED',
            'ROLLBACK_COMPLETE',
            'DELETE_IN_PROGRESS',
            'DELETE_FAILED',
            'UPDATE_IN_PROGRESS',
            'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
            'UPDATE_COMPLETE',
            'UPDATE_ROLLBACK_IN_PROGRESS',
            'UPDATE_ROLLBACK_FAILED',
            'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
            'UPDATE_ROLLBACK_COMPLETE'
        ]
    });

};

stacks_client.prototype.stack = function (stack_name) {
    return this.cloudformation.describeStackResourcesAsync({
        StackName: stack_name
    });
};

stacks_client.prototype.stackStatus = function (stack_name) {
    logger.info('getting stack status:', stack_name);
    return this.cloudformation.describeStacksAsync({
            StackName: stack_name
        })
        .then(function (response) {
            var status = _.first(response.Stacks).StackStatus;
            return status;
        });
};

stacks_client.prototype.createStack = function (params) {

    var template_body = {};
    var self = this;

    //init chef client
    var chef_client = require('./chef_client.js');
    chef_client.init(params.cms);

    return template_client.get(null, params)
        .then(function (template) {
            template_body = template;
            return self.cloudformation.createStackAsync({
                StackName: params.stack_name,
                TemplateBody: template,
                Tags: [{
                    Key: 'stack_type',
                    Value: 'Concord'
                }]
            });
        })
        .then(function () {
            logger.info('creating environment');
            return chef_client.createEnvironment(params);
        })
        .then(function () {
            logger.info('waiting for stack');
            return self.waitForStack(params.stack_name, 15, 2);
        })
        .then(function () {
            if (params.build_size === 'HA') {
                return elb_client.connectElbs(params);
            }
        })
        .catch(function (err) {
            logger.info(err);
            throw new Error(err);
        });

};

stacks_client.prototype.deleteAsg = function (params) {

    var self = this;

    return this.getTemplate(params.stack_name)
        .then(function (template_body) {
            var template = JSON.parse(template_body);
            var service = utls.remove_non_alpha(_.clone(params));
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
            return self.updateStack(JSON.stringify(template), params.stack_name);
        });

};

stacks_client.prototype.adjustSize = function (params) {

    var self = this;

    console.log('this');

    return this.getTemplate(params.stack_name)
        .then(function (template_body) {
            console.log('template', template_body);
            var template = JSON.parse(template_body);
            var service = utls.remove_non_alpha(_.clone(params));
            var cf_name = service.app_name + service.version;
            template.Resources['ASG' + cf_name].Properties.MinSize = params.min_size;
            template.Resources['ASG' + cf_name].Properties.DesiredCapacity = params.desired;
            template.Resources['ASG' + cf_name].Properties.MaxSize = params.max_size;
            return self.updateStack(JSON.stringify(template), params.stack_name);
        })
        .catch(function (err) {
            console.error(err);
        });
};

stacks_client.prototype.deleteStack = function (params) {

    var chef_client = require('./chef_client.js');
    chef_client.init(params.cms);

    return this.cloudformation.deleteStackAsync({
            StackName: params.stack_name
        })
        .then(function () {
            return chef_client.deleteEnvironmentNodes(params.stack_name);
        })
        .then(function (response) {
            return chef_client.deleteEnvironment(params.stack_name);
        })
        .then(function () {
            return 'successfully deleted stack: ' + params.stack_name;
        });
};

stacks_client.prototype.waitForStack = function (stack_name, timeout, max_attempts) {

    var self = this;
    var count = 0;

    timeout = timeout || 20;
    max_attempts = max_attempts || 500;

    return retry(function (cancelfn) {
        count++;
        return self.cloudformation.describeStacksAsync({
            StackName: stack_name
        }).then(function (response) {
            var stack = _.find(response.Stacks, function (x) {
                return x.StackName === stack_name;
            });
            logger.info('Polling for stack success: ', stack_name, stack.StackStatus);
            if (!stack) {
                cancelfn(new Error('Stack not found!'));
            } else if (count > max_attempts) {
                return;
            } else if (stack.StackStatus === 'UPDATE_COMPLETE' || stack.StackStatus === 'CREATE_COMPLETE') {
                // Success!
                logger.info('stack is ready', stack_name);
                return;
            } else if (stack.StackStatus === 'UPDATE_IN_PROGRESS' || stack.StackStatus === 'CREATE_IN_PROGRESS') {
                throw new Error('Stack not ready');
            } else {
                cancelfn(new Error('Stack in unexexpected state: ' + stack.StackStatus));
            }
        });
    }, {
        interval: 10 * 1000,
        timeout: timeout * 60 * 1000
    });

};


stacks_client.prototype.describe = function (stack_name) {

    return this.cloudformation.describeStacksAsync({
            StackName: stack_name
        })
        .then(function (response) {
            return _.first(response.Stacks);
        });
};



stacks_client.prototype.getTemplate = function (stack_name) {

    return this.cloudformation.getTemplateAsync({
            StackName: stack_name
        })
        .then(function (response) {
            return response.TemplateBody;
        });
};

stacks_client.prototype.updateStack = function (template, stack_name) {

    logger.info('updating stack:', stack_name);

    return this.cloudformation.updateStackAsync({
        StackName: stack_name,
        TemplateBody: template
    });
};

stacks_client.prototype.describeEvents = function (stack_name) {

    return this.cloudformation.describeStackEventsAsync({
            StackName: stack_name
        })
        .then(function (response) {
            return response.StackEvents;
        });
};

module.exports = new stacks_client();