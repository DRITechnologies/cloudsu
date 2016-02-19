var _ = require('underscore');
var AWS = require('aws-sdk');
var Promise = require('bluebird');

// load default configs
var config = require('../../config/config.js');


function ec2_client() {}

ec2_client.prototype.init = function (account) {
    this.ec2 = Promise.promisifyAll(new AWS.EC2(account));
};

ec2_client.prototype.instances = function (instance_array) {

    return this.ec2.describeInstancesAsync({
            InstanceIds: instance_array
        })
        .then(function (result) {
            return _.chain(result.Reservations).pluck('Instances').flatten();
        });

};


ec2_client.prototype.instancesByStack = function (stack_name) {

    return this.ec2.describeInstancesAsync({
        Filters: [{

            Name: 'tag:aws:cloudformation:stack-name',
            Values: [stack_name]
        }]
    });

};

ec2_client.prototype.describeKeyPairs = function () {

    return this.ec2.describeKeyPairsAsync()
        .then(function (keys) {
            return keys.KeyPairs;
        });

};

ec2_client.prototype.describeImages = function () {

    return this.ec2.describeImagesAsync({
            Owners: ['self', 'amazon']
        })
        .then(function (response) {
            console.log(response);
            return response.Images;
        });
};

ec2_client.prototype.sampleImages = function () {

    return config.get('aws_default_images')
        .then(function (images) {
            return images;
        });
};

ec2_client.prototype.instanceStoreMap = function () {

    return config.get('aws_instancestore_map')
        .then(function (stores) {
            return stores;
        });
};

module.exports = new ec2_client();