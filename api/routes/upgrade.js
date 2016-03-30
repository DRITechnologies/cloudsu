/*jshint esversion: 6 */
'use strict';

const logger = require('../../utls/logger.js');
const err_handler = require('../../utls/error_handler.js');

class Upgrade {
    constructor() {}

    run(req, res) {

        const params = req.body;
        params.aws_account = req.aws_account;
        params.cms = req.cms;
        params.aws = req.aws;


        const upgrade_client = require('../clients/upgrade_client.js');
        upgrade_client.init(params);

        return upgrade_client.run(params)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err_handler(err));
            });

    }

    rollback(req, res) {

        const params = req.body;
        params.aws_account = req.aws_account;
        params.cms = req.cms;
        params.aws = req.aws;


        const upgrade_client = require('../clients/upgrade_client.js');
        upgrade_client.init(params);

        return upgrade_client.rollback(params)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err_handler(err));
            });
    }
}

module.exports = new Upgrade();
