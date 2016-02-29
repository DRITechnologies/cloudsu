/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const _ = require('underscore');
const chef = require('chef');

const logger = require('../../utls/logger.js');


class ChefClient {
    constructor () {}

    init (account) {

        const _client = chef.createClient(account.username, account.key, account.url);
        this.client = Promise.promisifyAll(_client);

    }

    createEnvironment (params) {

        logger.info('creating chef environment', params);

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
            .spread((result, body) => {
                return body;
            });

    }

    getEnvironment (environment) {

        return this.client.getAsync(`/environments/${environment}`)
            .spread((result, body) => {
                return body;
            });

    }

    getEnvironments () {

        return this.client.getAsync('/environments')
            .spread((result, body) => {
                return body;
            });

    }

    getEnvironmentNodes (environment) {

        return this.client.getAsync(`/environments/${environment}/nodes`)
            .spread((result, body) => {
                return _.keys(body);
            });

    }

    updateEnvironment (params) {

        return this.client.putAsync(`/environments/${params.name}`, params)
            .spread((result, body) => {
                return body;
            });
    }

    deleteEnvironment (environment) {
        logger.info('deleting chef environment:', environment);
        return this.client.deleteAsync(`/environments/${environment}`)
            .spread((result, body) => {
                return body;
            });
    }

    deleteEnvironmentNodes (environment) {
        logger.info('removing all chef nodes in environment:', environment);

        const self = this;

        return this.getEnvironmentNodes(environment)
            .then(nodes => {
                return Promise.map(nodes, node => {
                    return self.deleteNode(node);
                });
            });
    }

    rollbackCheck (environment) {

        return this.getEnvironment(environment)
            .then(response => {
                return response.default_attributes.rollback_available;
            });
    }

    createNode (params) {

        return this.client.deleteAsync(`/nodes/${params.name}`, params)
            .spread((result, body) => {
                return body;
            });
    }

    getNode (node) {

        return this.client.getAsync(`/nodes/${node}`)
            .spread((result, body) => {
                return body;
            });

    }

    updateNode (node) {

        return this.client.putAsync(`/nodes/${node.name}`, node)
            .spread((result, body) => {
                return body;
            });

    }

    deleteNode (node) {
        const self = this;
        logger.info('deleting node:', node);
        return this.client.deleteAsync(`/nodes/${node}`)
            .spread((result, body) => {
                return self.deleteClient(node);
            })
            .spread((result, body) => {
                return body;
            });
    }

    createClient (params) {

        return this.client.postAsync('/clients', params)
            .spread((result, body) => {
                return body;
            });
    }

    getClient (client) {

        return this.client.getAsync(`/clients/${client}`)
            .spread((result, body) => {
                return body;
            });
    }

    deleteClient (client) {
        logger.debug('deleting client', client);
        return this.client.deleteAsync(`/clients/${client}`)
            .spread((result, body) => {
                return body;
            })
            .catch(err => {
                logger.info('Client does not exist');
            });
    }

    createDataBag (params) {
        return this.client.postAsync('/data/', params)
            .spread((response, body) => {
                return body;
            });
    }

    getDataBag (data_bag) {
        return this.client.getAsync(`/data/${data_bag}`)
            .spread((response, body) => {
                return _.keys(body);
            });
    }

    getDataBagItem (data_bag, item) {
        return this.client.getAsync(`/data/${data_bag}/${item}`)
            .spread((response, body) => {
                return body;
            });
    }

    saveDataBagItem (data_bag, item) {
        return this.client.putAsync(`/data/${data_bag}/${item}`)
            .spread((response, body) => {
                return body;
            });
    }
}

module.exports = new ChefClient();
