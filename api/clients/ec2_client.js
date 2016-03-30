/*jshint esversion: 6 */
'use strict';

const _ = require('underscore');
const AWS = require('aws-sdk');
const Promise = require('bluebird');

// load default configs
const config = require('../../config/config.js');


class Ec2Client {
    constructor() {}

    init(account) {
        this.ec2 = Promise.promisifyAll(new AWS.EC2(account));
    }

    instances(instance_array) {
        return this.ec2.describeInstancesAsync({
                InstanceIds: instance_array
            })
            .then(result => {
                return _.chain(result.Reservations)
                    .pluck('Instances')
                    .flatten();
            });
    }

    instancesByStack(stack_name) {
        return this.ec2.describeInstancesAsync({
            Filters: [{
                Name: 'tag:aws:cloudformation:stack-name',
                Values: [stack_name]
            }]
        });
    }

    describeKeyPairs() {
        return this.ec2.describeKeyPairsAsync()
            .then(keys => {
                return keys.KeyPairs;
            });
    }

    describeImages() {
        return this.ec2.describeImagesAsync({
                Owners: ['self', 'amazon']
            })
            .then(response => {
                return response.Images;
            });
    }

    sampleImages() {
        return config.get('aws_default_images')
            .then(images => {
                return images;
            });
    }

    instanceStoreMap() {
        return config.get('aws_instancestore_map')
            .then(stores => {
                return stores;
            });
    }

    describeSecurityGroups() {
        return this.ec2.describeSecurityGroupsAsync()
            .then(response => {
                return response.SecurityGroups;
            });
    }
}

module.exports = new Ec2Client();
