var crypto_client = require('../utls/crypto_client.js');
var config = require('../config/config.js');
var logger = require('../utls/logger.js');

function attach_aws_auth() {}

attach_aws_auth.prototype.run = function (req, res, next) {


    var aws_account = req.headers.aws_account || req.body.aws_account;

    if (!aws_account || aws_account === 'empty') {
        logger.info('did not recieve a header for aws account:', req.url);
        return;
    }

    var account_obj = {};

    return config.getServiceAccount({
            name: aws_account,
            type: 'aws'
        })
        .then(function (response) {
            req.aws = response;
            account_obj.region = req.headers.aws_region;
            account_obj.accessKeyId = response.accessKeyId;
            return crypto_client.decrypt_string(response.secretAccessKey);
        })
        .then(function (secretAccessKey) {
            account_obj.secretAccessKey = secretAccessKey
            req.aws_account = account_obj;
            return next();
        });
};

module.exports = new attach_aws_auth();