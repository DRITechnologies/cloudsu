var Promise = require('bluebird');
var exec = require('child_process').exec;
var path = require('path');

function utls_client() {}

utls_client.prototype.remove_non_alpha = function (app) {

    app.app_name = app.app_name.replace(/\W/g, '');
    app.version = app.version.replace(/\W/g, '');

    return app;

};

utls_client.prototype.clean_node_name = function (node) {

    var node_arr = node.split('-');
    return node_arr[0] + '-' + node_arr[1];

};


utls_client.prototype.run_cmd = function (cmd) {

    logger.info('running command:', cmd);
    return new Promise(function (resolve, reject) {
        exec(cmd, function (error, stdout, stderr) {
            if (error && error.code !== 0) {
                var details = {
                    stdout: stdout,
                    stderr: stderr,
                    error: error
                };

                return reject(details);
            } else {
                return resolve(stdout);
            }
        });

    });

}


module.exports = new utls_client();