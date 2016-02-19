var Promise = require('bluebird');
var _ = require('underscore');
var AWS = require('aws-sdk');
var logger = require('../../utls/logger.js');
var fs = require('fs');
var path = require('path');
var default_file = fs.readFileSync(path.resolve(__dirname, '../../config/defaults.json'), 'utf8');
var secure = require('../../config/secure_config.js');
var crypto_client = require('../../utls/crypto_client.js');
var token = require('../../utls/token.js');

function setup() {}

setup.prototype.run = function (req, res) {

    var params = req.body;
    var initial_data = JSON.parse(default_file);
    var aws_cred = _.clone(params.aws);
    var dynasty = require('dynasty')(aws_cred);
    var db;
    var db_arn;
    params.aws.bucket = params.bucket;

    return dynasty
        .create('concord', {
            key_schema: {
                hash: ['type', 'string'],
                range: ['name', 'string']
            }
        })
        .delay(5000)
        .then(function (response) {
            console.log(response.TableDescription.TableArn);
            db_arn = response.TableDescription.TableArn;
            db = dynasty.table('concord');
            return db.insert(initial_data);
        })
        .then(function () {
            logger.info('added initial config data to DynamoDB');
            var aws_account = _.clone(params.aws);
            aws_account.secretAccessKey = crypto_client.encrypt_string(aws_account.secretAccessKey);
            return db.insert(aws_account);
        })
        .then(function () {
            logger.info('added AWS data to DynamoDB');
            return setupQueue(params, db);
        })
        .then(function () {
            logger.info('created SQS queue');
            return setupBucket(params, db);
        })
        .then(function () {
            logger.info('created S3 bucket');
            return createIam(params, db, db_arn);
        })
        .then(function () {
            return createUser(params, db);
        })
        .then(function (response) {
            logger.info('created user account');
            res.status(200).json({
                info: 'Successful setup',
                token: response
            });
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });

};

function createIam(params, db, db_arn) {
    var policy = {
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
    var iam = Promise.promisifyAll(new AWS.IAM(
        params.aws
    ));
    var username = 'concord_db_access';

    return iam.createUserAsync({
            UserName: username
        })
        .then(function (response) {
            return iam.createAccessKeyAsync({
                UserName: username
            });
        })
        .then(function (response) {
            var db_key = response.AccessKey;
            db_key.region = params.aws.region;
            db_key = _.omit(db_key, 'CreateDate');
            return secure.save('db', db_key);
        })
        .then(function (response) {
            return iam.createPolicyAsync({
                PolicyDocument: JSON.stringify(policy),
                PolicyName: 'concord_db_access',
            });
        })
        .then(function (response) {
            return iam.attachUserPolicyAsync({
                PolicyArn: response.Policy.Arn,
                UserName: username
            });
        })
        .catch(function (err) {
            throw new Error(err);
        });

}


function setupQueue(params, db) {

    var queue_name = 'concord';
    var queue_url;
    var queue_arn;
    var topic;

    var sns = Promise.promisifyAll(new AWS.SNS(
        params.aws
    ));

    var sqs = Promise.promisifyAll(new AWS.SQS(
        params.aws
    ));

    return sqs.createQueueAsync({
            QueueName: queue_name
        })
        .then(function (url) {
            logger.info('queue_url', url.QueueUrl);
            queue_url = url.QueueUrl;
            return sns.createTopicAsync({
                Name: queue_name
            });
        })
        .then(function (topic_arn) {
            topic = topic_arn.TopicArn;
            logger.info('topic_arn', topic);
            return db.update({
                hash: params.aws.type,
                range: params.aws.name
            }, {
                topic_arn: topic
            });
        })
        .then(function () {
            logger.info('queue_url', queue_url);
            return sqs.getQueueAttributesAsync({
                QueueUrl: queue_url,
                AttributeNames: ['QueueArn']
            });
        })
        .then(function (arn) {
            queue_arn = arn.Attributes.QueueArn;
            logger.info('queue_arn', queue_arn);
            return sns.subscribeAsync({
                Protocol: 'sqs',
                TopicArn: topic,
                Endpoint: queue_arn
            });
        })
        .then(function () {
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
        .catch(function (err) {
            throw new Error(err);
        });
}

function createUser(params, db) {

    var user = params.user;

    user.aws_account = params.aws.name;
    user.aws_region = params.aws.region;
    user.hash = crypto_client.encrypt(user.password);
    user.token = token.sign(user.name);

    user = _.omit(user, ['password', 'confirm']);

    return db.insert(user)
        .then(function () {
            return user.token;
        });
}

function setupBucket(params, db) {

    var s3 = Promise.promisifyAll(new AWS.S3({
        accessKeyId: params.aws.accessKeyId,
        secretAccessKey: params.aws.secretAccessKey,
        region: params.bucket.region
    }));

    return s3.createBucketAsync({
            Bucket: params.bucket.name
        })
        .catch(function (err) {
            throw new Error(err);
        });
}

module.exports = new setup();