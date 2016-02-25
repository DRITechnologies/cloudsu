/*jshint esversion: 6 */
'use strict';

//logger
const logger = require('../../utls/logger.js');

//config
const config = require('../../config/config.js');


class Ec2 {
    constructor () {}

    sizes (req, res) {

        return config.get('aws_default_size_available')
            .then(size_array => {
                res.status(200).json(size_array);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    instances (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);
        const instance_array = req.params.instances.split(',');

        return ec2_client.instances(instance_array)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    sampleImages (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);

        return ec2_client.sampleImages()
            .then(images => {
                res.status(200).json(images);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    instancesByStack (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);

        return ec2_client.instancesByStack(req.params.stack_name)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });

    }

    describeKeyPairs (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);

        return ec2_client.describeKeyPairs()
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });
    }

    describeImages (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);

        return ec2_client.describeImages()
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });
    }

    instanceStoreMap (req, res) {

        const aws_account = req.aws_account;
        const ec2_client = require('../clients/ec2_client.js');
        ec2_client.init(aws_account);

        return ec2_client.instanceStoreMap()
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}


module.exports = new Ec2();
