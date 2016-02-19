//logger
var logger = require('../../utls/logger.js');

//config
var config = require('../../config/config.js');


function ec2() {}


ec2.prototype.sizes = function (req, res) {

    return config.get('aws_default_size_available')
        .then(function (size_array) {
            res.status(200).json(size_array);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

ec2.prototype.instances = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);
    var instance_array = req.params.instances.split(',');

    return ec2_client.instances(instance_array)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};


ec2.prototype.sampleImages = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);

    return ec2_client.sampleImages()
        .then(function (images) {
            res.status(200).json(images);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

ec2.prototype.instancesByStack = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);

    return ec2_client.instancesByStack(req.params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

ec2.prototype.describeKeyPairs = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);

    return ec2_client.describeKeyPairs()
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

ec2.prototype.describeImages = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);

    return ec2_client.describeImages()
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

ec2.prototype.instanceStoreMap = function (req, res) {

    var aws_account = req.aws_account;
    var ec2_client = require('../clients/ec2_client.js');
    ec2_client.init(aws_account);

    return ec2_client.instanceStoreMap()
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};


module.exports = new ec2();