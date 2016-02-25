/*jshint esversion: 6 */
'use strict'

const Promise = require('bluebird');
const repeat = require('repeat');
const fs = require('fs');
const sqs_client = require('../api/clients/sqs_client.js');
const logger = require('./logger.js');
const config = require('../config/config.js');

const secrets_path = 'secrets.json';

class QueueRider {
    constructor () {}

    poll () {

        let self = this;
        logger.debug('polling sqs for new servers');

        if (!fs.existsSync(secrets_path)) {
            logger.debug('initial setup has not been completed (secrets.json missing)');
            return
        }

        return config.getDefaultAws()
            .then(response => {
                sqs_client.init(response.aws_account);
                // return sqs_client.getMessage(response.queue.url);
            })
            .then(messages => {
                if (messages) {
                    return self.parseMessages(messages);
                } else {
                    throw 'found 0 SQS messages';
                }
            })
            .catch(err => {
                logger.debug(err);
            });
    }

    parseMessages (messages) {
        var self = this;
        return Promise.map(messages, function (message) {
            return self.printMessage(JSON.parse(message.Body));
        })
    }

    printMessage () {
        console.log(body);
    }

}

function kick_it() {

    const queue_rider = new QueueRider;
    repeat(queue_rider.poll).every(20, 's').start.in(Math.floor(Math.random() * 10) + 1, 'sec');

}

module.exports = kick_it();
