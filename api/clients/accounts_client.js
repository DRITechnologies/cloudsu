/*jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const crypto_client = require('../../utls/crypto_client.js');
const secure_config = require('../../config/secure_config.js');
const config = require('../../config/config.js');
const token_client = require('../../utls/token.js');
const logger = require('../../utls/logger.js');

class AccountsClient {
    constructor () {}

    checkPassword (email, password) {

        // check password against db
        return config.getUser(email)
            .then(user => {

                if (crypto_client.check_password(user.hash, password)) {
                    logger.info('successful login attempt:', email);
                    user.token = token_client.sign(user.name);
                    return user;
                } else {
                    logger.error('failed login attempt:', email);
                    throw new Error('incorrect email and password combination');
                }

            });
    }

    updateUser (params) {

        return config.updateUser(params)
            .then(user => {
                return user;
            });
    }

    createAccount (params) {

        return config.createUser(params);

    }

    removeAccount (email) {

        // remove account after verifying user has permissions
        return config.deleteUser(email);
    }

    checkToken (token) {

        return new Promise(function (resolve, reject) {

            const db = secure_config.get('db');

            if (!db) {
                return resolve({
                    login: false,
                    setup: false
                });
            } else if (!token) {
                return resolve({
                    login: false,
                    setup: true
                });
            }

            return token_client.verify(token)
                .then(response => {
                    return resolve({
                        login: true,
                        setup: true
                    });
                })
                .catch(err => {
                    return resolve({
                        login: false,
                        setup: true
                    });
                });

        });

    }
}


module.exports = new AccountsClient();
