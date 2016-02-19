var winston = require('winston');
var path = require('path');

//get root of application folder
var app_root = path.resolve(__dirname, '../');

winston.emitErrs = true;


var logger = new winston.Logger({
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
    write: function (message, encoding) {
        logger.info(message);
    }
};