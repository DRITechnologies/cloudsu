var AWS = require('aws-sdk');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

// logger
var logger = require('../../utls/logger.js');



function s3_client() {}

s3_client.prototype.init = function (account) {

    this.s3_client = Promise.promisifyAll(new AWS.S3(account));

};

s3_client.prototype.putObject = function (bucket, file_name, template) {

    var file_path = [bucket, file_name].join('');

    logger.info('s3 put to ' + file_path);

    return this.s3.putObjectAsync({
        Bucket: bucket,
        Key: file_path,
        Body: template
    });

};

s3_client.prototype.getObject = function (bucket, s3_path, file_destination) {

    return this.s3.getObjectAsync({
            Bucket: bucket,
            Key: s3_path
        })
        .then(function (response) {
            return fs.writeFileAsync(file_destination, response.Body);
        });
};


module.exports = new s3_client();