var logger = require('../utls/logger.js');
var cache = require('../utls/cache.js');
var Promise = require('bluebird');

function config() {}


config.prototype.save = function (key, value) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    // save settings to global
    var obj = {};
    obj[key] = value;
    logger.info('Saving key to database:', key);

    return db.update({
        hash: 'settings',
        range: 'global'
    }, obj);


};

config.prototype.get = function (key) {

    return new Promise(function (resolve, reject) {
        //check cache
        var global_config = cache.get('global');

        //return value if not undef
        if (global_config) {
            var val = global_config[key];
            if (val) {
                return resolve(val);
            }
        }

        // get settings from globals
        var db = require('../utls/db.js');
        logger.info('Getting data from db for key:', key);

        return db.find({
                hash: 'settings',
                range: 'global'
            })
            .then(function (settings) {
                cache.set('global', settings);
                return resolve(settings[key]);
            });
    });
};

config.prototype.getAll = function () {

    return new Promise(function (resolve, reject) {
        //check cache
        var val = cache.get('global');

        //return value if not undef
        if (val) {
            return resolve(val);
        }

        var db = require('../utls/db.js');
        logger.info('Getting all global settings');

        return db.find({
                hash: 'settings',
                range: 'global'
            })
            .then(function (response) {
                cache.set('global', response);
                return resolve(response);
            });

    });
};

config.prototype.saveServiceAccount = function (params) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    logger.info('Saving service account:', params);

    return db.insert(params);
};

config.prototype.getServiceAccounts = function (type) {

    return new Promise(function (resolve, reject) {
        //check cache
        var val = cache.get('all_service_accounts');

        //return value if not undef
        if (val) {
            return resolve(val);
        }

        var db = require('../utls/db.js');
        logger.info('Getting service accounts:', type);

        return db.findAll(type)
            .then(function (response) {
                cache.set('all_service_accounts', response);
                return resolve(response);
            });
    });
};

config.prototype.getServiceAccount = function (params) {

    return new Promise(function (resolve, reject) {
        //check cache
        var val = cache.get(params.name);

        //return value if not undef
        if (val) {
            logger.debug('using cache for account', params.name);
            return resolve(val);
        }

        var db = require('../utls/db.js');
        logger.info('Getting service account:', params.type, params.name);

        return db.find({
                hash: params.type,
                range: params.name
            })
            .then(function (response) {
                cache.set(params.name, response);
                return resolve(response);
            });

    });
};

config.prototype.deleteServiceAccount = function (params) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    logger.info('Deleting service account:', params.type, params.name);

    return db.remove({
        hash: params.type,
        range: params.name
    });
};

config.prototype.getUser = function (name) {

    return new Promise(function (resolve, reject) {
        //check cache
        var val = cache.get(name);

        //return value if not undef
        if (val) {
            return resolve(val);
        }

        var db = require('../utls/db.js');

        return db.find({
                hash: 'user',
                range: name
            })
            .then(function (response) {
                cache.set(name, response);
                return resolve(response);
            });

    });
};

config.prototype.updateUser = function (params) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    logger.info('updating user account', params.type, params.name);

    var name = params.name;
    var obj = _.omit(params, ['name', 'type']);

    return db.update({
        hash: 'user',
        range: params.name
    }, obj);

}

config.prototype.createUser = function (params) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    logger.info('created user account', params.type, params.name);

    return db.insert(params);
};

config.prototype.deleteUser = function (params) {

    //flush cache on updates
    cache.flush();

    var db = require('../utls/db.js');
    logger.info('deleting user account', params.type, params.name);

    return db.remove({
        hash: 'user',
        range: params.name
    });
};



module.exports = new config();