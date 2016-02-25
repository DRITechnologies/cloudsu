/*jshint esversion: 6 */
'use strict';

class Sqs {
    constructor () {}

    createQueue (req, res) {

        const aws_account = req.params.aws_account;
        const sqs_client = require('../clients/sqs_client.js');
        sqs_client.init(aws_account);

        return sqs_client.createQueue(req.params.QueueName)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    initialSetup (req, res) {

        const aws_account = req.aws_account;
        const sqs_client = require('../clients/sqs_client.js');
        sqs_client.init(aws_account);

        return sqs_client.initialSetup()
            .then(() => {
                res.status(200).json('successful creation');
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}

module.exports = new Sqs();
