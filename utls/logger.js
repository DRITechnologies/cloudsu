/*jshint esversion: 6 */
'use strict'

const winston = require('winston');
const path = require('path');

//get root of application folder
const app_root = path.resolve(__dirname, '../');

winston.emitErrs = true;


const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write(message, encoding) {
        logger.info(message);
    }
};