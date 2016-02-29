/*jshint esversion: 6 */
'use strict';

const logger = require('./logger.js');

module.exports =  function (err) {
    logger.error(err);
    if (err.cause) {
        return err.cause.message;
    } else if (err.message) {
        return err.message;
    } else {
        return err;
    }
};
