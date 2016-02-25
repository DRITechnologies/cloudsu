/*jshint esversion: 6 */
'use strict';

const logger = require('../utls/logger.js');
const cache = require('../utls/cache.js');
const Promise = require('bluebird');
const crypto_client = require('../utls/crypto_client.js');

class Config {
    constructor () {}

    save (key, value) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        // save settings to global
        const obj = {};
        obj[key] = value;
        logger.info('Saving key to database:', key);

        return db.update({
            hash: 'SETTINGS',
            range: 'GLOBAL'
        }, obj);


    }

    get (key) {

        return new Promise(function (resolve, reject) {
            //check cache
            const global_config = cache.get('GLOBAL');

            //return value if not undef
            if (global_config) {
                const val = global_config[key];
                if (val) {
                    return resolve(val);
                }
            }

            // get settings from globals
            const db = require('../utls/db.js');
            logger.info('Getting data from db for key:', key);

            return db.find({
                    hash: 'SETTINGS',
                    range: 'GLOBAL'
                })
                .then(settings => {
                    cache.set('GLOBAL', settings);
                    return resolve(settings[key]);
                });
        });
    }

    getAll () {

        return new Promise(function (resolve, reject) {
            //check cache
            const val = cache.get('GLOBAL');

            //return value if not undef
            if (val) {
                return resolve(val);
            }

            const db = require('../utls/db.js');
            logger.info('Getting all global settings');

            return db.find({
                    hash: 'SETTINGS',
                    range: 'GLOBAL'
                })
                .then(response => {
                    cache.set('GLOBAL', response);
                    return resolve(response);
                });

        });
    }

    saveServiceAccount (params) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        logger.info('Saving service account:', params.name);

        //determine what key to encrypt
        var key = 'key';
        if (params.type === 'AWS') {
            key = 'secret';
        }

        var secret = crypto_client.encrypt_string(params[key])
        params[key] = secret;

        return db.insert(params);

    }

    getServiceAccounts (type) {

        return new Promise(function (resolve, reject) {
            //check cache
            const val = cache.get(`${type}_service_accounts`);

            //return value if not undef
            if (val) {
                return resolve(val);
            }

            const db = require('../utls/db.js');
            logger.info('Getting service accounts:', type);

            return db.findAll(type)
                .then(response => {
                    cache.set(`${type}_service_accounts`, response);
                    return resolve(response);
                });
        });
    }

    getServiceAccount (params) {

        return new Promise(function (resolve, reject) {
            //check cache
            const val = cache.get(params.name);

            //return value if not undef
            if (val) {
                logger.debug('using cache for account', params.name);
                return resolve(val);
            }

            const db = require('../utls/db.js');
            let account = {};
            logger.info('Getting service account:', params.type, params.name);

            return db.find({
                    hash: params.type,
                    range: params.name
                })
                .then(response => {
                    account = response;
                    if (!account) {
                        return account;
                    } else if (account.type === 'AWS') {
                        return crypto_client.decrypt_string(account.secret);
                    } else {
                        return crypto_client.decrypt_string(account.key)
                    }
                    return false
                })
                .then(x => {
                    if (!account) {
                        return resolve(x);
                    } else if (account.type === 'AWS') {
                        account.accessKeyId = account.key;
                        account.secretAccessKey = x;
                    } else {
                        account.key = x;
                    }
                    cache.set(params.name, account);
                    return resolve(account);
                });
        });

    }

    getDefaultAws () {

        let query = {
            range: 'DEFAULT',
            hash: 'AWS'
        };

        const val = cache.get(`_${query.range}`);

        //return value if not undef
        if (val) {
            logger.debug('using cache for account', qeury.range);
            return resolve(val);
        }

        const db = require('../utls/db.js');
        let params = {};

        return db.find(query)
            .then(response => {
                params = response;
                params.aws_account = {};
                params.aws_account.region = response.region;
                params.aws_account.accessKeyId = response.key;
                return crypto_client.decrypt_string(response.secret);
            })
            .then(secret => {
                params.aws_account.secretAccessKey = secret;
                cache.set(`_${query.range}`, params.aws);
                return params;
            });
    }

    deleteServiceAccount (params) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        logger.info('Deleting service account:', params.type, params.name);

        return db.remove({
            hash: params.type,
            range: params.name
        });
    }

    getUser (name) {

        return new Promise(function (resolve, reject) {
            //check cache
            const val = cache.get(name);

            //return value if not undef
            if (val) {
                return resolve(val);
            }

            const db = require('../utls/db.js');

            return db.find({
                    hash: 'USER',
                    range: name
                })
                .then(response => {
                    cache.set(name, response);
                    return resolve(response);
                });

        });
    }

    updateUser (params) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        logger.info('updating user account', params.type, params.name);

        const name = params.name;
        const obj = _.omit(params, ['name', 'type']);

        return db.update({
            hash: 'USER',
            range: params.name
        }, obj);

    }

    createUser (params) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        logger.info('created user account', params.type, params.name);

        return db.insert(params);
    }

    deleteUser (params) {

        //flush cache on updates
        cache.flush();

        const db = require('../utls/db.js');
        logger.info('deleting user account', params.type, params.name);

        //XXX verify user is admin account

        return db.remove({
            hash: 'USER',
            range: params.name
        });
    }
}



module.exports = new Config();
