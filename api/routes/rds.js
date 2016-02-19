var AWS = require('aws-sdk');
var Promise = require('bluebird');

//Load default configs
var config = require('../config/config.js');

//aws
var rds = Promise.promisifyAll(new AWS.RDS({
    region: config.get('aws.default.region')
}));

var RDS_CLIENT = require('./rds_client.js');
var rds_client = new RDS_CLIENT();


module.exports = function (app) {


    app.get('/api/rds/list_dbs', function (req, res) {
        return rds.describeDBInstancesAsync()
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err.cause);
            });
    });

    app.get('/api/rds/snapshot_status/:DBInstanceIdentifier/:DBSnapshotIdentifier', function (req, res) {
        return rds_client.describe_snapshot({
                DBInstanceIdentifier: req.params.DBInstanceIdentifier,
                DBSnapshotIdentifier: req.params.DBSnapshotIdentifier
            })
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).json(err.cause);
            });
    });

    app.get('/api/rds/snapshot_status/:DBInstanceIdentifier', function (req, res) {
        return rds_client.describe_snapshot({
                DBInstanceIdentifier: req.params.DBInstanceIdentifier
            })
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).json(err.cause);
            });
    });

    app.get('/api/rds/db_status/:DBInstanceIdentifier', function (req, res) {
        return rds_client.describe_db({
                DBInstanceIdentifier: req.params.DBInstanceIdentifier
            })
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err.cause);
            });
    });

    app.put('/api/rds/create_snapshot', function (req, res) {
        return rds_client.create_snapshot(req.body)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err.cause);
            });
    });

    app.post('/api/rds/create_db_from_snapshot', function (req, res) {
        return rds_client.create_db_from_snapshot(req.body)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err.cause);
            });
    });

    app.patch('/api/rds/modify_db', function (req, res) {
        return rds_client.modify_db(req.body)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err.cause);
            });
    });


    app.delete('/api/rds/delete_db', function (req, res) {
        return rds_client.delete_db(req.body)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });


};
