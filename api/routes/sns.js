/*jshint esversion: 6 */
'use strict';

class Sns {
    constructor () {}

    createTopic (req, res) {

        const aws_account = req.params.aws_account;
        const sns_client = require('../clients/sns_client.js');
        sns_client.init(aws_account);

        return sns_client.createTopic(req.params.topic_name)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    confirmSubscription (req, res) {

        const aws_account = req.aws_account;
        const sns_client = require('../clients/sns_client.js');
        sns_client.init(aws_account);

        return sns_client.confirmSubscription(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    subscribe (req, res) {

        const aws_account = req.aws_account;
        const sns_client = require('../clients/sns_client.js');
        sns_client.init(aws_account);

        return sns_client.subscribe(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}

module.exports = new Sns();
