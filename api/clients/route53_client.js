var AWS = require('aws-sdk');
var Promise = require('bluebird');


function route53_client() {}


route53_client.prototype.init = function (account) {

    this.route53_client = Promise.promisifyAll(new AWS.Route53(account));

};




module.exports = new route53_client();