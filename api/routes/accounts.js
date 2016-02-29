/*jshint esversion: 6 */
'use strict';

const accounts_client = require('../clients/accounts_client.js');
const logger = require('../../utls/logger.js');
const err_handler = require('../../utls/error_handler.js');


class Accounts {
    constructor () {}

    attemptLogin (req, res) {
        const params = req.body;
        return accounts_client.checkPassword(params.email, params.password)
            .then(user => {
                res.status(200).json(user);
            })
            .catch(err => {
                res.status(401).json(err_handler(err));
            });
    }

    updateUser (req, res) {
        const params = req.body;
        return accounts_client.updateUser(params)
            .then(user => {
                res.status(200).json(user);
            })
            .catch(err => {
                res.status(500).json(err_handler(err));
            });
    }

    checkToken (req, res) {

        const token = req.params.token;
        return accounts_client.checkToken(token)
            .then(response => {
                logger.info(response);
                res.status(200).json(response);
            })
            .catch(err => {
                logger.error(err);
                res.status(500).json(err_handler(err));
            });

    }
}

module.exports = new Accounts();
