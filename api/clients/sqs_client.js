var Promise = require('bluebird');
var AWS = require('aws-sdk');

//logger
var logger = require('../../utls/logger.js');


function sqs_client() {}

sqs_client.prototype.init = function (account) {

    this.sqs = Promise.promisifyAll(new AWS.SQS(account));

};

sqs_client.prototype.createQueue = function (QueueName) {

    logger.info('Creating new queue', QueueName);

    return this.sqs.createQueueAsync({
            QueueName: QueueName
        })
        .then(function (queue) {
            return queue.QueueUrl;
        });
};

sqs_client.prototype.getQueueUrl = function (QueueName) {

    return this.sqs.getQueueUrlAsync({
        QueueName: QueueName
    });
};

sqs_client.prototype.getQueueArn = function (queue_url) {

    return this.sqs.getQueueAttributesAsync({
            QueueUrl: queue_url,
            AttributeNames: ['QueueArn']
        })
        .then(function (response) {
            return response.Attributes.QueueArn;
        });
};


module.exports = new sqs_client();