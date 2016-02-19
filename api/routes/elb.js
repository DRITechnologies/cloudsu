// logger
var logger = require('../../utls/logger.js');


function elb() {}


elb.prototype.connectElbs = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    return elb_client.connectElb(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

elb.prototype.disconnectElbs = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    return elb_client.disconnectElb(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });

};

elb.prototype.connectElb = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    return elb_client.connectElb(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

elb.prototype.disconnectElb = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    return elb_client.disconnectElb(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

elb.prototype.getAvailableElbs = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    return elb_client.getAvailableElbs(req.params.stack_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });

};

elb.prototype.getElbs = function (req, res) {

    var aws_account = req.aws_account;
    var elb_client = require('../clients/elb_client.js');
    elb_client.init(aws_account);

    var elb_array = req.params.elbs.split(',');

    return elb_client.getElbs(elb_array)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};



module.exports = new elb();