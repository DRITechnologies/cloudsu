function chef() {}


chef.prototype.createEnvironment = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.createEnvironment(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

chef.prototype.getEnvironment = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getEnvironment(req.params.environment)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getEnvironments = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getEnvironments()
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getEnvironmentNodes = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getEnvironmentNodes(req.params.environment)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

chef.prototype.updateEnvironment = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.updateEnvironment(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.deleteEnvironment = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.deleteEnvironment(req.params.environment)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.rollbackCheck = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.rollbackCheck(req.params.environment)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

chef.prototype.createNode = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.createNode(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getNode = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getNode(req.params.node)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.updateNode = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.updateNode(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.deleteNode = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.deleteNode(req.params.node)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.createClient = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.createClient(req.params.client)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getClient = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getClient(req.params.client)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.deleteClient = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.deleteClient(req.params.client)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.createDataBag = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.createDataBag(req.params.data_bag)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getDataBag = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getDataBag(req.params.data_bag)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.getDataBagItem = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.getDataBagItem(req.params.data_bag, req.params.item)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

chef.prototype.saveDataBagItem = function (req, res) {

    var chef_account = req.cms;
    var chef_client = require('../clients/chef_client.js');
    chef_client.init(chef_account);

    return chef_client.saveDataBagItem(req.params.data_bag, req.params.item)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};


module.exports = new chef();