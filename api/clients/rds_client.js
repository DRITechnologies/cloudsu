var AWS = require('aws-sdk');
var Promise = require('bluebird');
var _ = require('underscore');



function rds_client() {}

rds_client.prototype.init = function (account) {

    this.rds = Promise.promisifyAll(new AWS.RDS(account));

};



rds_client.prototype.restore_db = function (params) {
    return this.rds.restoreDBInstanceFromDBSnapshotAsync(params);
};

rds_client.prototype.delete_db = function (params) {
    return this.rds.deleteDBInstanceAsync(params);
};

rds_client.prototype.describe_db = function (params) {
    return this.rds.describeDBInstancesAsync(params);
};

rds_client.prototype.describe_snapshot = function (params) {
    return this.rds.describeDBSnapshotsAsync(params);
};

rds_client.prototype.create_snapshot = function (params) {
    return this.rds.createDBSnapshotAsync(params);
};

rds_client.prototype.modify_db = function (params) {
    return this.rds.modifyDBInstanceAsync(params);
};

rds_client.prototype.create_db_from_snapshot = function (params) {
    params = this.default_restore_params(params);
    return this.rds.restoreDBInstanceFromDBSnapshotAsync(params);
};

rds_client.prototype.default_restore_params = function (params) {

    return _.defaults(params, {
        DBInstanceClass: 'db.m1.small',
        DBInstanceIdentifier: 'db-migration-test',
        PubliclyAccessible: false,
        Engine: 'postgres',
        AvailabilityZone: 'us-west-2c'
    });

};

module.exports = new rds_client();