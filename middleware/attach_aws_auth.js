/*jshint esversion: 6 */
'use strict';

const crypto_client = require('../utls/crypto_client.js');
const config = require('../config/config.js');
const logger = require('../utls/logger.js');

class AttachAwsAuth {
    constructor () {}

    run (req, res, next) {

        let aws_account = req.headers.aws_account || req.body.aws_account;

        if (!aws_account || aws_account === 'empty') {
            logger.info('did not recieve a header for aws account:', req.url);
            return;
        }

        let aws_object = {}

        return config.getServiceAccount({
                name: aws_account,
                type: 'AWS'
            })
            .then(response => {
                req.aws = response;
                req.aws_account = {
                    region: req.headers.aws_region,
                    accessKeyId: response.accessKeyId,
                    secretAccessKey: response.secretAccessKey
                };
                return next();
            });
    }
}

module.exports = new AttachAwsAuth();
