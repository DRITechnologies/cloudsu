/*jshint esversion: 6 */
'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');


class IamClient {
    constructor() {}

    init(account) {
        this.iam = Promise.promisifyAll(new AWS.IAM(account));
    }

    listServerCertificates() {
        return this.iam.listServerCertificatesAsync()
            .then(certs => {
                return certs.ServerCertificateMetadataList;
            });
    }

    listInstanceProfiles() {
        return this.iam.listInstanceProfilesAsync()
            .then(response => {
                return response.InstanceProfiles;
            });
    }
}

module.exports = new IamClient();
