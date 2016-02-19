// logger
var logger = require('../../utls/logger.js');


function stacks() {

}

stacks.prototype.listStacks = function (req, res) {

    var aws_account = req.aws_account;

    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.listStacks()
        .then(function (stack_list) {
            res.status(200).json(stack_list);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

stacks.prototype.stack = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.stack(req.params.stack_name)
        .then(function (stack) {
            res.status(200).json(stack);
        })
        .catch(function (err) {
            logger.info(err);
            res.status(500).json(err);
        });
};

stacks.prototype.stackStatus = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.stackStatus(req.params.stack_name)
        .then(function (status) {
            res.status(200).json(status);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });

};

stacks.prototype.createStack = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    var params = req.body;
    params.cms = req.cms;
    params.aws = req.aws;

    return stacks_client.createStack(params)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });

};

stacks.prototype.deleteStack = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    var params = {
        cms: req.cms,
        stack_name: req.params.stack_name
    };

    return stacks_client.deleteStack(params)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

stacks.prototype.describe = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.describe(req.params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

stacks.prototype.deleteAsg = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.deleteAsg(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

stacks.prototype.adjustSize = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.adjustSize(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

stacks.prototype.getTemplate = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.getTemplate(req.params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

stacks.prototype.updateStack = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);
    var params = req.body;

    return stacks_client.updateStack(params.template, params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

stacks.prototype.describeEvents = function (req, res) {

    var aws_account = req.aws_account;
    var stacks_client = require('../clients/stacks_client.js');
    stacks_client.init(aws_account);

    return stacks_client.describeEvents(req.params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

module.exports = new stacks();