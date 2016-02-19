var AWS = require('aws-sdk');
var Promise = require('bluebird');


function iam_client() {}

iam_client.prototype.init = function (account) {

    this.iam = Promise.promisifyAll(new AWS.IAM(account));

};

iam_client.prototype.listServerCertificates = function () {
    return this.iam.listServerCertificatesAsync()
        .then(function (certs) {
            return certs.ServerCertificateMetadataList;
        });
};

iam_client.prototype.listInstanceProfiles = function () {
    return this.iam.listInstanceProfilesAsync()
        .then(function (response) {
            return response.InstanceProfiles;
        });
};

module.exports = new iam_client();