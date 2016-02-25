/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const AWS = require('aws-sdk');
const logger = require('../../utls/logger.js');
const fs = require('fs');
const path = require('path');
const default_file = fs.readFileSync(path.resolve(__dirname, '../../config/defaults.json'), 'utf8');
const secure = require('../../config/secure_config.js');
const config = require('../../config/config.js');
const crypto_client = require('../../utls/crypto_client.js');
let token = require('../../utls/token.js');


function createIam(params, db, db_arn) {
    const policy = {
        Version: '2012-10-17',
        Statement: [{
            Effect: 'Allow',
            Action: [
                'dynamodb:*'
            ],
            Resource: [
                db_arn
            ]
        }]
    };
    const iam = Promise.promisifyAll(new AWS.IAM(
        params.aws
    ));
    const username = 'concord_db_access';

    return iam.createUserAsync({
            UserName: username
        })
        .then(response => {
            return iam.createAccessKeyAsync({
                UserName: username
            });
        })
        .then(response => {
            let db_key = response.AccessKey;
            db_key.region = params.aws.region;
            db_key = _.omit(db_key, 'CreateDate');
            return secure.save('db', db_key);
        })
        .then(response => {
            return iam.createPolicyAsync({
                PolicyDocument: JSON.stringify(policy),
                PolicyName: 'concord_db_access'
            });
        })
        .then(response => {
            return iam.attachUserPolicyAsync({
                PolicyArn: response.Policy.Arn,
                UserName: username
            });
        })
        .catch(err => {
            throw new Error(err);
        });

}


function setupQueue(params, db) {

    const queue_name = 'concord';
    let queue_url;
    let queue_arn;
    let sns_topic;

    const sns = Promise.promisifyAll(new AWS.SNS(
        params.aws
    ));

    const sqs = Promise.promisifyAll(new AWS.SQS(
        params.aws
    ));

    return sqs.createQueueAsync({
            QueueName: queue_name
        })
        .then(url => {
            logger.info('queue_url', url.QueueUrl);
            queue_url = url.QueueUrl;
            return sns.createTopicAsync({
                Name: queue_name
            });
        })
        .then(topic_arn => {
            sns_topic = topic_arn.TopicArn;
            logger.info('created sns topic', sns_topic);
            return db.update({
                hash: params.aws.type,
                range: params.aws.name
            }, {
                topic_arn: sns_topic
            });
        })
        .then(() => {
            logger.info('queue_url', queue_url);
            return sqs.getQueueAttributesAsync({
                QueueUrl: queue_url,
                AttributeNames: ['QueueArn']
            });
        })
        .then(arn => {

            logger.info('adding permissions for sns to sqs');

            queue_arn = arn.Attributes.QueueArn;
            let policy = {
                'Version': '2012-10-17',
                'Statement': [{
                    'Sid': 'Concord SNS Policy',
                    'Effect': 'Allow',
                    'Principal': '*',
                    'Action': 'sqs:SendMessage',
                    'Resource': queue_arn,
                    'Condition': {
                        'ArnEquals': {
                            'aws:SourceArn': sns_topic
                        }
                    }
                }]
            };

            return sqs.setQueueAttributesAsync({
                Attributes: {
                    Policy: JSON.stringify(policy)
                },
                QueueUrl: queue_url
            });
        })
        .then(() => {

            logger.info('queue_arn', queue_arn);
            return sns.subscribeAsync({
                Protocol: 'sqs',
                TopicArn: sns_topic,
                Endpoint: queue_arn
            });
        })
        .then(() => {
            return db.update({
                hash: params.aws.type,
                range: params.aws.name
            }, {
                queue: {
                    name: queue_name,
                    arn: queue_arn,
                    url: queue_url
                }
            });
        })
        .catch(err => {
            throw new Error(err);
        });
}

function createUser(params, db) {

    let user = params.user;

    user.aws_account = params.aws.name;
    user.aws_region = params.aws.region;
    user.hash = crypto_client.encrypt(user.password);
    user.token = token.sign(user.name);

    user = _.omit(user, ['password', 'confirm']);

    return db.insert(user)
        .then(() => {
            return user.token;
        });
}


class Setup {
    constructor () {}

    run (req, res) {

        const params = req.body;
        const db_name = 'concord';
        const initial_data = JSON.parse(default_file);
        const aws_cred = _.clone(params.aws);
        const dynasty = require('dynasty')(aws_cred);
        let db;
        let db_arn;

        return dynasty.create(db_name, {
                key_schema: {
                    hash: ['type', 'string'],
                    range: ['name', 'string']
                }
            })
            .delay(5000)
            .then(response => {
                logger.info('created DynamoDB', response.TableDescription.TableArn);
                db_arn = response.TableDescription.TableArn;
                db = dynasty.table(db_name);
                return db.insert(initial_data);
            })
            .then(() => {
                logger.info('added initial config data to DynamoDB');
                let aws_account = _.clone(params.aws);
                aws_account.secret = crypto_client.encrypt_string(aws_account.secret);
                return db.insert(aws_account);
            })
            .then(() => {
                logger.info('added AWS data to DynamoDB');
                return setupQueue(params, db);
            })
            .then(() => {
                logger.info('created SQS queue');
                return createIam(params, db, db_arn);
            })
            .then(() => {
                logger.info('created iam user');
                return createUser(params, db);
            })
            .then(response => {
                logger.info('created admin user');
                return config.saveServiceAccount(params.cms);
            })
            .then(response => {
                logger.info('added chef account account');
                res.status(200).json({
                    info: 'Successful setup',
                    token: response
                });
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err);
            });

    }
}


module.exports = new Setup();
