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

    update (req, res) {

        const params = req.body;
        return accounts_client.update(params)
            .then(user => {
                res.status(200).json(user);
            })
            .catch(err => {
                res.status(500).json(err_handler(err));
            });
    }

    create (req, res) {

        const params = req.body;
        return accounts_client.create(params)
        .then(response => {
          res.status(200).json(response);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    }

    delete (req, res) {

      req.user.user_to_delete = req.body.name;
      return accounts_client.delete(req.user)
      .then(response => {
           res.status(200).json(response);
      })
      .catch(err => {
           res.status(500).json(err);
      });
    }

    list (req, res) {

      return accounts_client.list()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => {
        res.status(500).json(err);
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

    getServiceToken (req, res) {

        return accounts_client.getServiceToken(req.user)
        .then(response => {
          res.status(200).json(response);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    }
}

module.exports = new Accounts();
