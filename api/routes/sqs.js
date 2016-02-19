function sqs() {}

sqs.prototype.createQueue = function (req, res) {

    var aws_account = req.params.aws_account;
    var sqs_client = require('../clients/sqs_client.js');
    sqs_client.init(aws_account);

    return sqs_client.createQueue(req.params.QueueName)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

sqs.prototype.initialSetup = function (req, res) {

    var aws_account = req.aws_account;
    var sqs_client = require('../clients/sqs_client.js');
    sqs_client.init(aws_account);

    return sqs_client.initialSetup()
        .then(function () {
            res.status(200).json('successful creation');
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

module.exports = new sqs();