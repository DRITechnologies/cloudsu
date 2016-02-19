//config service
var config = require('../../config/config.js');


// logger
var logger = require('../../utls/logger.js');


function main() {}


main.prototype.region = function (req, res) {
    //return default region from global configs
    var region = 'us-west-2';
    res.status(200).json(region);
};

main.prototype.regions = function (req, res) {
    var region = [
        'us-east-1',
        'us-west-2',
        'us-west-1',
        'eu-west-1',
        'eu-central-1',
        'ap-southeast-1',
        'ap-northeast-1',
        'ap-southeast-2',
        'ap-northeast-2'
    ];

    if (region) {
        res.status(200).json(region);
    } else {
        res.status(500).json('not found');
    }
};

main.prototype.regionMap = function (req, res) {

    var region = req.headers.aws_region;

    return config.get('region_map')
        .then(function (map) {
            res.status(200).json(map[region]);
        });

};

main.prototype.bucketRegions = function (req, res) {
    var bucket_region = [
        'us-east-1',
        'us-west-1',
        'us-west-2',
        'eu-west-1',
        'ap-southeast-1',
        'ap-southeast-2',
        'ap-northeast-1',
        'sa-east-1'
    ];

    res.status(200).json(bucket_region);

};

main.prototype.listServerCertificates = function (req, res) {

    var aws_account = req.aws_account;
    var iam_client = require('../clients/iam_client.js');
    iam_client.init(aws_account);

    return iam_client.listServerCertificates()
        .then(function (certs) {
            res.status(200).json(certs);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

main.prototype.listInstanceProfiles = function (req, res) {

    var aws_account = req.aws_account;
    var iam_client = require('../clients/iam_client.js');
    iam_client.init(aws_account);

    return iam_client.listInstanceProfiles()
        .then(function (roles) {
            res.status(200).json(roles);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

main.prototype.saveServiceAccount = function (req, res) {

    return config.saveServiceAccount(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};

main.prototype.getServiceAccounts = function (req, res) {

    return config.getServiceAccounts(req.params.type)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            logger.error(err);
            res.status(500).json(err);
        });
};



module.exports = new main();