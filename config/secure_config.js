var _ = require('underscore');
var nconf = require('nconf');
var path = require('path');
var cache = require('../utls/cache.js');
var SECURE_SETTINGS_FILE = 'secrets.json';
var secrets_file = path.resolve(__dirname, SECURE_SETTINGS_FILE);


nconf.file(SECURE_SETTINGS_FILE, {
    file: secrets_file,
    secure: {
        secret: 'gbXQ2y+8cpl63n&',
        alg: 'aes-256-ctr'
    }
});

function secure_config() {}

secure_config.get = function get(key) {

    var value = cache.get(key);

    if (!value) {
        value = nconf.get(key);
        if (_.isUndefined(value)) {
            return false;
        }
        cache.set(key, value);
    }
    return value;
};

secure_config.save = function save(key, value) {

    return new Promise(function (resolve, reject) {

        nconf.set(key, value);
        nconf.save(function (err) {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
            return resolve();
        });

    });
};


module.exports = secure_config;