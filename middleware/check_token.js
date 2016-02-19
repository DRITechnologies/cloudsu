var config = require('../config/config.js');
var token_client = require('../utls/token.js');

var logger = require('../utls/logger.js');

function attach_aws_auth() {}

attach_aws_auth.prototype.run = function (req, res, next) {

    var token = req.headers.token || req.body.token;

    logger.debug('authenticating with token:', token);

    return token_client.verify(token)
        .then(function (response) {
            logger.debug('verified token:', token);
            return config.getUser(response.name)
                .then(function (user) {
                    logger.debug('Got user:', user);
                    req.user = user;
                    return next();
                });
        })
        .catch(function (err) {
            logger.error(err);
            res.status(401).json('not authorized');
        });
};

module.exports = new attach_aws_auth();