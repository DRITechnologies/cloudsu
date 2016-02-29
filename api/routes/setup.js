/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const AWS = require('aws-sdk');
const logger = require('../../utls/logger.js');
const err_handler = require('../../utls/error_handler.js');
const fs = require('fs');
const path = require('path');
const defaults_file = fs.readFileSync(path.resolve(__dirname, '../../config/defaults.json'), 'utf8');
const secure = require('../../config/secure_config.js');
const crypto_client = require('../../utls/crypto_client.js');
const token = require('../../utls/token.js');


function createServerIam(params, db, config_db_arn, servers_db_arn) {
    const policy = {
        Version: '2012-10-17',
        Statement: [{
            Effect: 'Allow',
            Action: [
                'dynamodb:*'
            ],
            Resource: [
                config_db_arn,
                servers_db_arn
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

function createClientIam(params, db, servers_db_arn) {
    const policy = {
        Version: '2012-10-17',
        Statement: [{
            Effect: 'Allow',
            Action: [
                'dynamodb:GetItem'
            ],
            Resource: [
                servers_db_arn
            ]
        }]
    };
    const iam = Promise.promisifyAll(new AWS.IAM(
        params.aws
    ));
    const username = 'concord_client_access';

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
            return secure.save('db_client', db_key);
        })
        .then(response => {
            return iam.createPolicyAsync({
                PolicyDocument: JSON.stringify(policy),
                PolicyName: 'concord_client_db_access'
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

            logger.info('adding sns permissions to sqs');

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

            logger.info(`subscribing ${queue_arn} to topic ${sns_topic}`);
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
        const servers_db_name = 'concord_servers';
        const config_db_name = 'concord_config';
        const initial_data = JSON.parse(defaults_file);
        const aws_cred = _.clone(params.aws);
        const dynasty = require('dynasty')(aws_cred);
        let servers_db_arn;
        let config_db_arn;
        let db;

        return dynasty.create(config_db_name, {
                key_schema: {
                    hash: ['type', 'string'],
                    range: ['name', 'string']
                },
                throughput: { write: 2, read: 2 }
            })
            .delay(5000)
            .then(response => {
                config_db_arn = response.TableDescription.TableArn;
                logger.info('created DynamoDB', response.TableDescription.TableArn);
                db = dynasty.table(config_db_name);
                return dynasty.create(servers_db_name, {
                    key_schema: {
                        hash: ['instance_id', 'string']
                    },
                    throughput: { write: 2, read: 2 }
                });
            })
            .then(response => {
                servers_db_arn = response.TableDescription.TableArn;
                logger.info('created DynamoDB', response.TableDescription.TableArn);
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
                return createServerIam(params, db, config_db_arn, servers_db_arn);
            })
            .then(() => {

                logger.info('created server IAM user');
                return createClientIam(params, db, servers_db_arn);
            })
            .then(() => {
                logger.info('created client IAM user');
                return createUser(params, db);
            })
            .then(response => {
                var chef_account = _.clone(params.cms);
                chef_account.key = crypto_client.encrypt_string(chef_account.key);
                return db.insert(chef_account);
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
                res.status(500).json(err_handler(err));
            });

    }
}


module.exports = new Setup();
