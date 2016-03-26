/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const chef = require('chef');

const logger = require('../../utls/logger.js');


class ChefClient {
    constructor() {}

    init(account) {

        const _client = chef.createClient(account.username, account.key, account.url);
        this.client = Promise.promisifyAll(_client);

    }

    createEnvironment(params) {

        let concord_params = _.clone(params);

        concord_params = _.omit(concord_params, [
            'elb_groups_string',
            'instance_groups_string',
            'cms_validator',
            'recipes_string',
            'cms_validator',
            'cms_url',
            'cms_key',
            'cms',
            'aws'
        ]);

        logger.info('creating chef environment', concord_params);

        const default_attributes = {};
        default_attributes.status = 'READY';
        default_attributes.rollback_available = false;
        default_attributes.concord_params = concord_params;

        const environment = {
            name: params.stack_name,
            description: 'Managed by Concord',
            json_class: 'Chef::Environment',
            chef_type: 'environment',
            cookbook_versions: {},
            default_attributes: default_attributes,
            override_attributes: {}
        };

        return this.client.postAsync('/environments', environment)
            .then(result => {
                return result.body;
            });

    }

    getEnvironment(environment) {

        return this.client.getAsync(`/environments/${environment}`)
            .then(result => {
                return result.body;
            });

    }

    getEnvironments() {

        return this.client.getAsync('/environments')
            .then(result => {
                return result.body;
            });

    }

    getEnvironmentNodes(environment) {

        return this.client.getAsync(`/environments/${environment}/nodes`)
            .then(result => {
                return _.keys(result.body);
            })
            .catch(err => {
                logger.error(err);
            });

    }

    updateEnvironment(params) {

        return this.client.putAsync(`/environments/${params.name}`, params)
            .then(result => {
                return result.body;
            });
    }

    deleteEnvironment(environment) {
        logger.info('deleting chef environment:', environment);
        return this.client.deleteAsync(`/environments/${environment}`)
            .then(result => {
                return result.body;
            });
    }

    deleteEnvironmentNodes(environment) {

        logger.info('removing all chef nodes in environment:', environment);

        const self = this;

        return this.getEnvironmentNodes(environment)
            .then(nodes => {
                // catch empty response
                if (!nodes) {
                    return;
                }
                // remove node and client from chef
                return Promise.map(nodes, node => {
                    return self.deleteNode(node);
                });
            });
    }

    rollbackCheck(environment) {

        return this.getEnvironment(environment)
            .then(response => {
                return response.default_attributes.rollback_available;
            });
    }

    createNode(params) {

        return this.client.postAsync(`/nodes/${params.name}`, params)
            .then(result => {
                return result.body;
            });
    }

    getNode(node) {

        return this.client.getAsync(`/nodes/${node}`)
            .then(result => {
                return result.body;
            });

    }

    updateNode(node) {

        return this.client.putAsync(`/nodes/${node.name}`, node)
            .then(result => {
                return result.body;
            });

    }

    deleteNode(node) {
        const self = this;
        logger.info('deleting chef node:', node);
        return this.client.deleteAsync(`/nodes/${node}`)
            .then(result => {
                return self.deleteClient(node);
            })
            .catch(err => {
                logger.error(err);
            });
    }

    createClient(params) {

        return this.client.postAsync('/clients', params)
            .then(result => {
                return result.body;
            });
    }

    getClient(client) {

        return this.client.getAsync(`/clients/${client}`)
            .then(result => {
                return result.body;
            });
    }

    deleteClient(client) {
        logger.debug('deleting chef client', client);
        return this.client.deleteAsync(`/clients/${client}`)
            .then(result => {
                return result.body;
            })
            .catch(err => {
                logger.info('Client does not exist');
            });
    }

    createDataBag(params) {
        return this.client.postAsync('/data/', params)
            .then(result => {
                return result.body;
            });
    }

    getDataBag(data_bag) {
        return this.client.getAsync(`/data/${data_bag}`)
            .then(result => {
                return _.keys(result.body);
            });
    }

    getDataBagItem(data_bag, item) {
        return this.client.getAsync(`/data/${data_bag}/${item}`)
            .then(result => {
                return result.body;
            });
    }

    saveDataBagItem(data_bag, item) {
        return this.client.putAsync(`/data/${data_bag}/${item}`)
            .then(result => {
                return result.body;
            });
    }

    recipes() {
        return this.client.getAsync('/cookbooks/_recipes')
            .then(result => {
                return result.body;
            });
    }
}

module.exports = new ChefClient();
