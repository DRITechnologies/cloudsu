var AWS = require('aws-sdk');
var Promise = require('bluebird');


function autoscale_client() {}

autoscale_client.prototype.init = function (account) {

    this.autoscaling = Promise.promisifyAll(new AWS.AutoScaling(
        account
    ));

};

autoscale_client.prototype.describeAutoScalingGroups = function (groups) {

    return this.autoscaling.describeAutoScalingGroupsAsync({
        AutoScalingGroupNames: groups
    });
};

autoscale_client.prototype.addTags = function (as_group, terminate_date) {

	return this.autoscaling.createOrUpdateTagsAsync({
                Tags: [{
                    ResourceId: as_group.PhysicalResourceId,
                    Key: 'terminate_date',
                    Value: terminate_date,
                    PropagateAtLaunch: true,
                    ResourceType: 'auto-scaling-group'
                }]
            });
};

module.exports = new autoscale_client();