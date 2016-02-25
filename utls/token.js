'use strict'

const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

const key = 'gbXQ2y+8cpl63n&';
const logger = require('./logger.js');



class token {
    constructor() {}

    sign(name) {
        logger.info('singing token for:', name);
        return jwt.sign({ name: name }, key, { expiresIn: '24h' });
    }

    verify(token) {

        return new Promise(function (resolve, reject) {

                jwt.verify(token, key, (err, decoded) => {
                    if (err) {
                        logger.error(err);
                        return reject(err);
                    }
                    return resolve(decoded);
                });

            })
            .catch(err => {
                throw new Error('error verifying token');
            });

    }
}


module.exports = new token();