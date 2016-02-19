var Promise = require('bluebird');
var logger = require('./logger.js');

var jwt = require('jsonwebtoken');
var key = 'gbXQ2y+8cpl63n&';

var logger = require('./logger.js');



function token() {}

token.prototype.sign = function (name) {
    logger.info('singing token for:', name);
    return jwt.sign({ name: name }, key, { expiresIn: '24h' });
};

token.prototype.verify = function (token) {

    return new Promise(function (resolve, reject) {

            jwt.verify(token, key, function (err, decoded) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                return resolve(decoded);
            });

        })
        .catch(function (err) {
            throw new Error('error verifying token');
        });

};


module.exports = new token();