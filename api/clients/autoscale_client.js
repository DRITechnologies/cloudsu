/*jshint esversion: 6 */
'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');


class AutoscaleClient {
    constructor () {}

    init (account) {

        this.autoscaling = Promise.promisifyAll(new AWS.AutoScaling(
            account
        ));

    }

    describeAutoScalingGroups (groups) {

        return this.autoscaling.describeAutoScalingGroupsAsync({
            AutoScalingGroupNames: groups
        });
    }

    addTags (as_group, terminate_date) {

        return this.autoscaling.createOrUpdateTagsAsync({
            Tags: [{
                ResourceId: as_group.PhysicalResourceId,
                Key: 'terminate_date',
                Value: terminate_date,
                PropagateAtLaunch: true,
                ResourceType: 'auto-scaling-group'
            }]
        });
    }
}

module.exports = new AutoscaleClient();
