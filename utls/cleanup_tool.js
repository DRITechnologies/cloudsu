/*jshint esversion: 6 */
'use strict';

const AWS = require('aws-sdk');
const repeat = require('repeat');
const _ = require('underscore');
const Promise = require('bluebird');
const moment = require('moment');
const logger = require('./logger.js');
const config = require('../config/config.js');

//aws
const autoscaling = Promise.promisifyAll(new AWS.AutoScaling({
    region: config.get('aws.default.region')
}));
const cloudformation = Promise.promisifyAll(new AWS.CloudFormation({
    region: config.get('aws.default.region')
}));

const S3_CLIENT = require('../api/s3.js');
const DEFAULT_S3_URL = config.get('aws.default.bucket.url');


function parse_tags(Tags) {
    const app_name = _.chain(Tags)
        .find(x => {
            return x.Key === 'app_name';
        })
        .value()
        .Value;
    const version = _.chain(Tags)
        .find(x => {
            return x.Key === 'version';
        })
        .value()
        .Value;
    const stack_name = _.chain(Tags)
        .find(x => {
            return x.Key === 'aws:cloudformation:stack-name';
        })
        .value()
        .Value;
    const omit_list = [
        `ASG${app_name}${version}`,
        `LC${app_name}${version}`,
        `CPUH${app_name}${version}`,
        `CPUL${app_name}${version}`,
        `SPU${app_name}${version}`,
        `SPD${app_name}${version}`,
        `WC${app_name}${version}`
    ];

    return {
        stack_name: stack_name,
        omit_list: omit_list
    };
}

function remove_scale_group(params) {
    const s3_client = new S3_CLIENT();

    return cloudformation.getTemplateAsync({
            StackName: params.stack_name
        })
        .then(response => {
            const template = JSON.parse(response.TemplateBody);
            template.Resources = _.omit(template.Resources, params.omit_list);
            return s3_client.putObject(params.stack_name, JSON.stringify(template));
        })
        .then(res => {
            const url = DEFAULT_S3_URL + params.stack_name;
            return cloudformation.validateTemplateAsync({
                TemplateURL: url
            });
        })
        .then(() => {
            const url = DEFAULT_S3_URL + params.stack_name;
            return cloudformation.updateStackAsync({
                StackName: params.stack_name,
                TemplateURL: url
            });
        })
        .then(() => {
            logger.info(
                'removed items because of their group_terminate_date tag',
                params.omit_list
            );
        });
}

function check_scale_groups() {
    logger.info('polling for stale scale-groups');
    return autoscaling.describeAutoScalingGroupsAsync()
        .then(response => {
            const omit_list = {};
            return Promise.map(response.AutoScalingGroups, scale_group => {
                    const date_string = _.chain(scale_group.Tags)
                        .find(x => {
                            return x.Key === 'group_terminate_date';
                        })
                        .value();

                    if (!date_string) {
                        return;
                    }

                    const term_date = moment(date_string.Value, 'YYYYMMDDHHmm');
                    if (moment() > term_date) {
                        return Promise.try((resolve, reject) => {
                                return parse_tags(scale_group.Tags);
                            })
                            .then(omit_obj => {
                                omit_list[omit_obj.stack_name] = _.union(omit_obj.omit_list, omit_list[omit_obj.stack_name]);
                            });
                    }
                })
                .then(() => {
                    return Promise.map(_.keys(omit_list), stack_name => {
                        const params = {
                            omit_list: omit_list[stack_name],
                            stack_name: stack_name
                        };
                        return remove_scale_group(params);
                    });
                });

        })
        .catch(err => {
            logger.error(err);
        });
}

function parse_tags(Tags) {
    const app_name = _.chain(Tags)
        .find(x => {
            return x.Key === 'app_name';
        })
        .value()
        .Value;
    const version = _.chain(Tags)
        .find(x => {
            return x.Key === 'version';
        })
        .value()
        .Value;
    const stack_name = _.chain(Tags)
        .find(x => {
            return x.Key === 'aws:cloudformation:stack-name';
        })
        .value()
        .Value;
    const omit_list = [
        `ASG${app_name}${version}`,
        `LC${app_name}${version}`,
        `CPUH${app_name}${version}`,
        `CPUL${app_name}${version}`,
        `SPU${app_name}${version}`,
        `SPD${app_name}${version}`,
        `WC${app_name}${version}`
    ];

    return {
        stack_name: stack_name,
        omit_list: omit_list
    };
}

function start_polling() {
    logger.info('starting cleanup tool');
    repeat(check_scale_groups)
        .every(15, 'm')
        .start.in(Math.floor(Math.random() * 10) + 1, 'sec');
}


module.exports = start_polling();
