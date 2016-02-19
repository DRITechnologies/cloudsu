function sns() {}


sns.prototype.createTopic = function (req, res) {

    var aws_account = req.params.aws_account;
    var sns_client = require('../clients/sns_client.js');
    sns_client.init(aws_account);

    return sns_client.createTopic(req.params.topic_name)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

sns.prototype.confirmSubscription = function (req, res) {

    var aws_account = req.aws_account;
    var sns_client = require('../clients/sns_client.js');
    sns_client.init(aws_account);

    return sns_client.confirmSubscription(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};


sns.prototype.subscribe = function (req, res) {

    var aws_account = req.aws_account;
    var sns_client = require('../clients/sns_client.js');
    sns_client.init(aws_account);

    return sns_client.subscribe(req.body)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

module.exports = new sns();