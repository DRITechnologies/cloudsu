var Promise = require('bluebird');
var _ = require('underscore');
var chef = require('chef');

//logger
var logger = require('../../utls/logger.js');


function chef_client() {}

chef_client.prototype.init = function (account) {

    var _client = chef.createClient(account.username, account.key, account.url);
    this.client = Promise.promisifyAll(_client);

};


chef_client.prototype.createEnvironment = function (params) {

    logger.info('creating chef environment', params);

    var concord_params = _.clone(params);

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

    var default_attributes = {};
    default_attributes.status = 'READY';
    default_attributes.rollback_available = false;
    default_attributes.concord_params = concord_params;

    var environment = {
        name: params.stack_name,
        description: 'Managed by Concord',
        json_class: 'Chef::Environment',
        chef_type: 'environment',
        cookbook_versions: {},
        default_attributes: default_attributes,
        override_attributes: {}
    };

    return this.client.postAsync('/environments', environment)
        .spread(function (result, body) {
            return body;
        });

};



chef_client.prototype.getEnvironment = function (environment) {

    return this.client.getAsync('/environments/' + environment)
        .spread(function (result, body) {
            return body;
        });

};

chef_client.prototype.getEnvironments = function () {

    return this.client.getAsync('/environments')
        .spread(function (result, body) {
            return body;
        });

};

chef_client.prototype.getEnvironmentNodes = function (environment) {

    return this.client.getAsync('/environments/' + environment + '/nodes')
        .spread(function (result, body) {
            return _.keys(body);
        });

};

chef_client.prototype.updateEnvironment = function (params) {

    return this.client.putAsync('/environments/' + params.name, params)
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.deleteEnvironment = function (environment) {
    logger.info('deleting chef environment:', environment);
    return this.client.deleteAsync('/environments/' + environment)
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.deleteEnvironmentNodes = function (environment) {
    logger.info('removing all chef nodes in environment:', environment);

    var self = this;

    return this.getEnvironmentNodes(environment)
        .then(function (nodes) {
            return Promise.map(nodes, function (node) {
                return self.deleteNode(node);
            });
        });
};

chef_client.prototype.rollbackCheck = function (environment) {

    return this.getEnvironment(environment)
        .then(function (response) {
            return response.default_attributes.rollback_available;
        });
};

chef_client.prototype.createNode = function (params) {

    return this.client.deleteAsync('/nodes/' + params.name, params)
        .spread(function (result, body) {
            return body;
        });
};


chef_client.prototype.getNode = function (node) {

    return this.client.getAsync('/nodes/' + node)
        .spread(function (result, body) {
            return body;
        });

};

chef_client.prototype.updateNode = function (node) {

    return this.client.putAsync('/nodes/' + node.name, node)
        .spread(function (result, body) {
            return body;
        });

};

chef_client.prototype.deleteNode = function (node) {
    var self = this;
    logger.info('deleted:', node);
    return this.client.deleteAsync('/nodes/' + node)
        .spread(function (result, body) {
            return self.deleteClient(node);
        })
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.createClient = function (params) {

    return this.client.putAsync('/clients/', params)
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.getClient = function (client) {

    return this.client.getAsync('/clients/' + client)
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.deleteClient = function (client) {

    return this.client.deleteAsync('/clients/' + client)
        .spread(function (result, body) {
            return body;
        });
};

chef_client.prototype.createDataBag = function (params) {
    return this.client.postAsync('/data/', params)
        .spread(function (response, body) {
            return body;
        });
};

chef_client.prototype.getDataBag = function (data_bag) {
    return this.client.getAsync('/data/' + data_bag)
        .spread(function (response, body) {
            return _.keys(body);
        });
};

chef_client.prototype.getDataBagItem = function (data_bag, item) {
    return this.client.getAsync('/data/' + data_bag + '/' + item)
        .spread(function (response, body) {
            return body;
        });
};

chef_client.prototype.saveDataBagItem = function (data_bag, item) {
    return this.client.putAsync('/data/' + data_bag + '/' + item)
        .spread(function (response, body) {
            return body;
        });
};



module.exports = new chef_client();