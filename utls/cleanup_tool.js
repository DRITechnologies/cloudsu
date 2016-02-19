var AWS = require('aws-sdk');
var repeat = require('repeat');
var _ = require('underscore');
var Promise = require('bluebird');
var moment = require('moment');

//load default configs
var config = require('../config/config.js');

//logger
var logger = require('../utls/logger.js');

//aws
var autoscaling = Promise.promisifyAll(new AWS.AutoScaling({
    region: config.get('aws.default.region')
}));
var cloudformation = Promise.promisifyAll(new AWS.CloudFormation({
    region: config.get('aws.default.region')
}));

var S3_CLIENT = require('../api/s3.js');
var DEFAULT_S3_URL = config.get('aws.default.bucket.url');

function check_scale_groups() {
    logger.info('polling for stale scale-groups')
    return autoscaling.describeAutoScalingGroupsAsync()
        .then(function (response) {
            var omit_list = {};
            return Promise.map(response.AutoScalingGroups, function (scale_group) {
                    var date_string = _.chain(scale_group.Tags)
                        .find(function (x) {
                            return x.Key === 'group_terminate_date';
                        })
                        .value();

                    if (!date_string) {
                        return;
                    };

                    var term_date = moment(date_string.Value, 'YYYYMMDDHHmm');
                    if (moment() > term_date) {
                        return Promise.try(function (resolve, reject) {
                                return parse_tags(scale_group.Tags);
                            })
                            .then(function (omit_obj) {
                                omit_list[omit_obj.stack_name] = _.union(omit_obj.omit_list, omit_list[omit_obj.stack_name]);
                            });
                    }
                })
                .then(function () {
                    return Promise.map(_.keys(omit_list), function (stack_name) {
                        var params = {
                            omit_list: omit_list[stack_name],
                            stack_name: stack_name
                        }
                        return remove_scale_group(params);
                    });
                });

        })
        .catch(function (err) {
            logger.error(err);
        });
}

function start_polling() {
    logger.info('starting cleanup tool');
    repeat(check_scale_groups).every(15, 'm').start.in(Math.floor(Math.random() * 10) + 1, 'sec');
}

function remove_scale_group(params) {
    var s3_client = new S3_CLIENT();

    return cloudformation.getTemplateAsync({
            StackName: params.stack_name
        })
        .then(function (template) {
            var template = JSON.parse(template.TemplateBody);
            template.Resources = _.omit(template.Resources, params.omit_list);
            return s3_client.putObject(params.stack_name, JSON.stringify(template));
        })
        .then(function (res) {
            var url = DEFAULT_S3_URL + params.stack_name;
            return cloudformation.validateTemplateAsync({
                TemplateURL: url
            });
        })
        .then(function () {
            var url = DEFAULT_S3_URL + params.stack_name;
            return cloudformation.updateStackAsync({
                StackName: params.stack_name,
                TemplateURL: url
            });
        })
        .then(function () {
            logger.info('removed items because of their group_terminate_date tag', params.omit_list);
        });
}

function parse_tags(Tags) {
    var app_name = _.chain(Tags)
        .find(function (x) {
            return x.Key === 'app_name';
        })
        .value().Value;
    var version = _.chain(Tags)
        .find(function (x) {
            return x.Key === 'version';
        })
        .value().Value;
    var stack_name = _.chain(Tags)
        .find(function (x) {
            return x.Key === 'aws:cloudformation:stack-name';
        })
        .value().Value;
    var omit_list = [
        'ASG' + app_name + version,
        'LC' + app_name + version,
        'CPUH' + app_name + version,
        'CPUL' + app_name + version,
        'SPU' + app_name + version,
        'SPD' + app_name + version,
        'WC' + app_name + version
    ];

    return {
        stack_name: stack_name,
        omit_list: omit_list
    };
}

module.exports = start_polling();