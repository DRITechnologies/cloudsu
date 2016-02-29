/*jshint esversion: 6 */
'use strict';

const config = require('../config/config.js');
const token_client = require('../utls/token.js');
const logger = require('../utls/logger.js');

class AttachAwsAuth {
    constructor () {}

    run (req, res, next) {

        const token = req.headers.token || req.body.token;

        logger.debug('authenticating with token:', token);

        return token_client.verify(token)
            .then(response => {
                logger.debug('verified token:', token);
                return config.getUser(response.name)
                    .then(user => {
                        logger.debug('Got user:', user);
                        req.user = user;
                        return next();
                    });
            })
            .catch(err => {
                logger.error(err);
                res.status(401).json('not authorized');
            });
    }
}

module.exports = new AttachAwsAuth();
