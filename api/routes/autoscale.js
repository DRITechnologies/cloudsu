function autoscale() {}


autoscale.prototype.adjustSize = function (req, res) {

    var params = req.body;
    var aws_account = req.aws_account;
    var autoscale_client = require('../clients/autoscale_client.js');
    autoscale_client.init(aws_account);

    return autoscale_client.adjustSize(params)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

autoscale.prototype.describeAutoScalingGroups = function (req, res) {

    var groups = req.params.groups.split(',');
    var aws_account = req.aws_account;
    var autoscale_client = require('../clients/autoscale_client.js');
    autoscale_client.init(aws_account);

    return autoscale_client.describeAutoScalingGroups(groups)
        .then(function (response) {
            res.status(200).json(response);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};


module.exports = new autoscale();