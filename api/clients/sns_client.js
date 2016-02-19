var AWS = require('aws-sdk');
var Promise = require('bluebird');


function sns_client() {}

sns_client.prototype.init = function (account) {

    this.sns = Promise.promisifyAll(new AWS.SNS(account));

};


sns_client.prototype.createTopic = function (topic_name) {

    return this.sns.createTopicAsync({
            Name: topic_name
        })
        .then(function (topic) {
            return topic.TopicArn;
        });
};

sns_client.prototype.confirmSubscription = function (params) {

    return this.sns.confirmSubscriptionAsync({
        Token: params.token,
        TopicArn: params.topic_arn,
        AuthenticateOnUnsubscribe: 'false'
    });
};

sns_client.prototype.subscribe = function (params) {

    /*
    http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#subscribe-property
    {
    TopicArn: arn::autoscale 
    Protocol: sqs
    Endpoint: arn::sqs 
    }
    */

    return this.sns.subscribeAsync({
        Protocol: params.Protocol,
        TopicArn: params.TopicArn,
        Endpoint: params.Endpoint
    });
};


module.exports = new sns_client();