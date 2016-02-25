/*jshint esversion: 6 */
'use strict';

class Chef {
    constructor () {}

    createEnvironment (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.createEnvironment(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });

    }

    getEnvironment (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getEnvironment(req.params.environment)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getEnvironments (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getEnvironments()
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getEnvironmentNodes (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getEnvironmentNodes(req.params.environment)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });

    }

    updateEnvironment (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.updateEnvironment(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    deleteEnvironment (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.deleteEnvironment(req.params.environment)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    rollbackCheck (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.rollbackCheck(req.params.environment)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });

    }

    createNode (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.createNode(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getNode (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getNode(req.params.node)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    updateNode (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.updateNode(req.body)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    deleteNode (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.deleteNode(req.params.node)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    createClient (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.createClient(req.params.client)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getClient (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getClient(req.params.client)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    deleteClient (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.deleteClient(req.params.client)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    createDataBag (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.createDataBag(req.params.data_bag)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getDataBag (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getDataBag(req.params.data_bag)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    getDataBagItem (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.getDataBagItem(req.params.data_bag, req.params.item)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }

    saveDataBagItem (req, res) {

        const chef_account = req.cms;
        const chef_client = require('../clients/chef_client.js');
        chef_client.init(chef_account);

        return chef_client.saveDataBagItem(req.params.data_bag, req.params.item)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}


module.exports = new Chef();
