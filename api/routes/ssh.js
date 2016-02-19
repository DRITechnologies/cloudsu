var SSH_CLIENT = require('./ssh_client.js');
var ssh_client = new SSH_CLIENT();

// handle errors
var handle_error = require('../utls/handle_error.js');

// logger
var logger = require('../utls/logger.js');

module.exports = function (app) {

    app.patch('/api/run_command', function (req, res) {

        var params = req.body;
        if (params.scope === 'instance') {
            return ssh_client.instance_trigger(params)
                .then(function (response) {
                    res.status(200).json({
                        status: 'ok',
                        results: response
                    });
                })
                .catch(function (err) {
                    logger.error(err);
                    res.status(500).json(handle_error(err));
                });
        } else if (params.scope === 'asg') {
            return ssh_client.asg_trigger(params)
                .then(function (response) {
                    res.status(200).json({
                        status: 'ok',
                        results: response
                    });
                })
                .catch(function (err) {
                    logger.error(err);
                    res.status(500).json(handle_error(err));
                });
        } else if (params.scope === 'stack') {
            return ssh_client.stack_trigger(params)
                .then(function (response) {
                    res.status(200).json({
                        status: 'ok',
                        results: response
                    });
                })
                .catch(function (err) {
                    logger.error(err);
                    res.status(500).json(handle_error(err));
                });
        } else if (params.scope === 'stack_upgrade') {
            return ssh_client.stack_upgrade_trigger(params)
                .then(function (response) {
                    res.status(200).json({
                        status: 'ok',
                        results: response
                    });
                })
                .catch(function (err) {
                    logger.error(err);
                    res.status(500).json(handle_error(err));
                });

        } else {
            res.status(500).json('ssh scope not specified');
        }
    });

};
