/*jshint esversion: 6 */
'use strict';

const _ = require('underscore');
const logger = require('../utls/logger.js');
const cache = require('../utls/cache.js');
const Promise = require('bluebird');
const crypto_client = require('../utls/crypto_client.js');

function decrypt(account) {

    var key;
    var account;

    if (account.type === 'CMS') {
        key = account.key;
    } else if (account.type === 'AWS') {
        key = account.secret;
    } else {
        return account;
    }

    return crypto_client.decrypt_string(key)
        .then(x => {
            if (account.type === 'AWS') {
                account.aws = {};
                account.aws.region = account.region;
                account.aws.accessKeyId = account.key;
                account.aws.secretAccessKey = x;
            } else {
                account.key = x;
            }
            return (account);
        });
}




class Config {
    constructor() {}

    save(key, value) {

        //added inside function to call after Setup
        const db = require('../utls/db.js');

        //flush cache on updates
        cache.flush();

        // save settings to global
        const obj = {};
        obj[key] = value;
        logger.info(`Saving key to database: ${key}`);

        return db.update({
            hash: 'SETTINGS',
            range: 'GLOBAL'
        }, obj);


    }

    get(key) {

        return new Promise(function(resolve, reject) {

            const db = require('../utls/db.js');

            logger.info(`Getting data from db for key: ${key}`);
            return cache.get('GLOBAL')
                .then(val => {

                    if (global_config) {
                        const val = global_config[key];
                        if (val) {
                            return resolve(val);
                        }
                    }
                    // get settings from globals
                    return db.find({
                            hash: 'SETTINGS',
                            range: 'GLOBAL'
                        })
                        .then(settings => {
                            cache.set('GLOBAL', settings);
                            return resolve(settings[key]);
                        });
                });
        });
    }

    getAll() {

        return new Promise(function(resolve, reject) {

            logger.info('Getting all global settings');

            const db = require('../utls/db.js');
            return cache.get('GLOBAL')
                .then(val => {

                    //return value if not undef
                    if (val) {
                        return resolve(val);
                    }

                    return db.find({
                            hash: 'SETTINGS',
                            range: 'GLOBAL'
                        })
                        .then(response => {
                            cache.set('GLOBAL', response);
                            return resolve(response);
                        });
                });

        });
    }

    saveServiceAccount(params) {

        //flush cache on updates
        cache.flush();

        logger.info(`Saving service account: ${params.name}`);

        //determine what key to encrypt
        var key = 'key';
        if (params.type === 'AWS') {
            key = 'secret';
        }

        let secret = crypto_client.encrypt_string(params[key]);
        params[key] = secret;

        const db = require('../utls/db.js');

        return db.insert(params);

    }

    getServiceAccounts(type) {

        logger.info(`Getting service accounts: ${type}`);

        const db = require('../utls/db.js');

        return cache.get(`${type}_service_accounts`)
            .then(val => {

                if (val) {
                    return val;
                }

                return db.findAll(type)
                    .then(response => {
                        cache.set(`${type}_service_accounts`, response);
                        return response;
                    });
            });
    }

    getServiceAccount(params) {

        logger.info(`Getting service account: ${params.type} ${params.name}`);

        const db = require('../utls/db.js');
        return cache.get(`${params.name}_${params.type}`)
            .then(val => {

                //return value if not undef
                if (val) {
                    logger.debug(`Using cache for account: ${params.name}`);
                    return decrypt(val);
                }

                return db.find({
                        hash: params.type,
                        range: params.name
                    })
                    .then(response => {
                        cache.set(`${params.name}_${params.type}`, response);
                        return decrypt(response);
                    });
            });

    }

    getDefaultAws() {

        const query = {
            range: 'DEFAULT',
            hash: 'AWS'
        };
        const db = require('../utls/db.js');

        return cache.get(`AWS_${query.range}`)
            .then(val => {
                //return value if not undef
                if (val) {
                    logger.debug(`Using cache for account ${query.range}`);
                    return decrypt(val);
                }

                return db.find(query)
                    .then(response => {
                        cache.set(`AWS_${query.range}`, response);
                        return decrypt(response);
                    });
            });
    }

    deleteServiceAccount(params) {

        //flush cache on updates
        cache.flush();

        logger.info(`Deleting service account: ${params.type} ${params.name}`);

        const db = require('../utls/db.js');

        return db.remove({
            hash: params.type,
            range: params.name
        });
    }

    getUser(name) {

        const db = require('../utls/db.js');

        return cache.get(name)
            .then(val => {

                //return value if not undef
                if (val) {
                    return val;
                }

                return db.find({
                        hash: 'USER',
                        range: name
                    })
                    .then(response => {
                        cache.set(name, response);
                        return response;
                    });

            });
    }

    updateUser(params) {

        //flush cache on updates
        cache.flush();

        logger.info(`Updating user account ${params.type} ${params.name}`);

        const obj = _.omit(params, ['name', 'type']);
        const db = require('../utls/db.js');

        return db.update({
            hash: 'USER',
            range: params.name
        }, obj);

    }

    createUser(params) {

        //flush cache on updates
        cache.flush();

        logger.info(`Created user account ${params.type} ${params.name}`);
        const db = require('../utls/db.js');

        return db.find({
            hash: params.type,
            range: params.name
        }).then(response => {
            if (!response) {
                return db.insert(params);
            }
            throw new Error(`User ${params.name} already exists`);
        });
    }

    deleteUser(name) {

        //flush cache on updates
        cache.flush();

        logger.info(`Deleting user account ${name}`);
        const db = require('../utls/db.js');

        return db.remove({
            hash: 'USER',
            range: name
        });
    }

    listUsers() {

        const db = require('../utls/db.js');
        return cache.get('all_users')
            .then(users => {

                if (users) {
                    return users;
                }

                return db.findAll('USER')
                    .then(users => {
                        cache.set('all_users', users);
                        return users;
                    });
            });
    }
}



module.exports = new Config();
