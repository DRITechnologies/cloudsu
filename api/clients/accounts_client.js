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

    update (params) {

        return config.updateUser(params)
            .then(user => {
                return user;
            });
    }

    create (params) {
        //createUser
        return config.createUser(params);
    }

    delete (user) {

        if (user.groups.indexOf('admin') > -1) {
            throw new Error(user.name + ' is not in the admin group');
        }
        // remove account after verifying user has permissions
        return config.deleteUser(user.user_to_delete);
    }

    list () {
       // list all users
       return config.listUsers();
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

    getServiceToken (user) {

      return new Promise(function (resolve, reject) {
      //check if token already exists and return
      if (user.service_token) {
        return resolve(user.service_token);
      }

      const self = this;

      //create new service token and saves to db
      return token_client.create(user)
      .then(token => {
        user.service_token = token;
        return self.update(user);
      })
      .then(() => {
        return resolve(user.service_token);
      })
      .catch(err => {
        return reject(err);
      });

    });
    }
}


module.exports = new AccountsClient();
