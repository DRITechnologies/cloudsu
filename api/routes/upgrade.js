var logger = require('../../utls/logger.js');

function upgrade() {}

upgrade.prototype.run = function (req, res) {

    var params = req.body;
    params.aws_account = req.aws_account;
    params.cms = req.cms;
    params.aws = req.aws;


    var upgrade_client = require('../clients/upgrade_client.js');
    upgrade_client.init(params);

    return upgrade_client.run(params)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });

};

upgrade.prototype.rollback = function (req, res) {

    var params = req.body;
    params.aws_account = req.aws_account;
    params.cms = req.cms;
    params.aws = req.aws;


    var upgrade_client = require('../clients/upgrade_client.js');
    upgrade_client.init(params);

    return upgrade_client.rollback(params)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

module.exports = new upgrade();