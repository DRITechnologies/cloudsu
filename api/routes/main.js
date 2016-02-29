/*jshint esversion: 6 */
'use strict';

//config service
const config = require('../../config/config.js');


// logger
const logger = require('../../utls/logger.js');


class Main {
    constructor () {}

    region (req, res) {
        //return default region from global configs
        const region = 'us-west-2';
        res.status(200).json(region);
    }

    regions (req, res) {
        const region = [
            'us-east-1',
            'us-west-2',
            'us-west-1',
            'eu-west-1',
            'eu-central-1',
            'ap-southeast-1',
            'ap-northeast-1',
            'ap-southeast-2',
            'ap-northeast-2'
        ];

        if (region) {
            res.status(200).json(region);
        } else {
            res.status(500).json('not found');
        }
    }

    regionMap (req, res) {

        const region = req.headers.aws_region;

        return config.get('region_map')
            .then(map => {
                res.status(200).json(map[region]);
            });

    }

    bucketRegions (req, res) {
        const bucket_region = [
            'us-east-1',
            'us-west-1',
            'us-west-2',
            'eu-west-1',
            'ap-southeast-1',
            'ap-southeast-2',
            'ap-northeast-1',
            'sa-east-1'
        ];

        res.status(200).json(bucket_region);

    }

    listServerCertificates (req, res) {

        const aws_account = req.aws_account;
        const iam_client = require('../clients/iam_client.js');
        iam_client.init(aws_account);

        return iam_client.listServerCertificates()
            .then(certs => {
                res.status(200).json(certs);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    listInstanceProfiles (req, res) {

        const aws_account = req.aws_account;
        const iam_client = require('../clients/iam_client.js');
        iam_client.init(aws_account);

        return iam_client.listInstanceProfiles()
            .then(roles => {
                res.status(200).json(roles);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });
    }

    saveServiceAccount (req, res) {

        return config.saveServiceAccount(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });
    }

    getServiceAccount (req, res) {

        return config.getServiceAccount(req.params)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getServiceAccounts (req, res) {

        return config.getServiceAccounts(req.params.type)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });
    }
}



module.exports = new Main();
