var AWS = require('aws-sdk');
var Promise = require('bluebird');
var _ = require('underscore');

//logger
var logger = require('../../utls/logger.js');

var utls = require('../../utls/utilities.js');

function elb_client() {}

elb_client.prototype.init = function (account) {

    this.elb = Promise.promisifyAll(new AWS.ELB(account));
    this.autoscaling = Promise.promisifyAll(new AWS.AutoScaling(account));
    this.cloudformation = Promise.promisifyAll(new AWS.CloudFormation(account));

};

elb_client.prototype.connectElbs = function (params) {

    var self = this;

    return this.cloudformation.describeStackResourcesAsync({
        StackName: params.stack_name
    }).then(function (stack) {
        return Promise.map(params.update_list, function (app) {
            var service = utls.remove_non_alpha(_.clone(app));
            var as_name = ['ASG', service.app_name, service.version].join('');
            var elb_name = ['ELB', service.app_name].join('');
            var as_group = _.find(stack.StackResources, function (x) {
                return x.LogicalResourceId === as_name;
            });
            var elb = _.find(stack.StackResources, function (x) {
                return x.LogicalResourceId === elb_name;
            });
            logger.info('Connecting ASG:', as_name, 'to ELB:', elb_name);
            return self.autoscaling.attachLoadBalancersAsync({
                AutoScalingGroupName: as_group.PhysicalResourceId,
                LoadBalancerNames: [elb.PhysicalResourceId]
            });
        });
    });
};

elb_client.prototype.disconnectElbs = function (params) {

    var self = this;

    return this.cloudformation.describeStackResourcesAsync({
        StackName: params.stack_name
    }).then(function (stack) {
        return Promise.map(params.last_update_list, function (app) {
            var service = utls.remove_non_alpha(_.clone(app));
            var as_name = ['ASG', service.app_name, service.version].join('');
            var elb_name = ['ELB', service.app_name].join('');
            var as_group = _.find(stack.StackResources, function (x) {
                return x.LogicalResourceId === as_name;
            });
            var elb = _.find(stack.StackResources, function (x) {
                return x.LogicalResourceId === elb_name;
            });
            logger.info('Disconnecting ASG:', as_name, 'from ELB:', elb_name);
            return self.autoscaling.detachLoadBalancersAsync({
                AutoScalingGroupName: as_group.PhysicalResourceId,
                LoadBalancerNames: [elb.PhysicalResourceId]
            });
        });
    });
};

elb_client.prototype.connectElb = function (params) {

    return this.autoscaling.attachLoadBalancersAsync({
        AutoScalingGroupName: params.scale_group,
        LoadBalancerNames: [params.elb]
    });
};

elb_client.prototype.disconnectElb = function (params) {

    return this.autoscaling.detachLoadBalancersAsync({
        AutoScalingGroupName: params.scale_group,        LoadBalancerNames: [params.elb]
    });
};

elb_client.prototype.getAvailableElbs = function (stack_name) {

    return this.cloudformation.describeStackResourcesAsync({
            StackName: stack_name
        })
        .then(function (stack) {
            var elbs = _.filter(stack.StackResources, function (x) {
                return x.ResourceType === 'AWS::ElasticLoadBalancing::LoadBalancer';
            });
            return elbs;
        });
};

elb_client.prototype.getElbs = function (elbs) {

    return this.elb.describeLoadBalancersAsync({
        LoadBalancerNames: elbs
    });

};

module.exports = new elb_client();