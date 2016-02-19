var logger = require('../../utls/logger.js');
var crypto_client = require('../../utls/crypto_client.js');
var config = require('../../config/config.js');
var token_client = require('../../utls/token.js');

function accounts_client() {}


accounts_client.prototype.checkPassword = function (email, password) {

    // check password against db
    return config.getUser(email)
        .then(function (user) {

            if (crypto_client.check_password(user.hash, password)) {
                logger.info('successful login attempt:', email);
                user.token = token_client.sign(user.name);
                return user;
            } else {
                logger.error('failed login attempt:', email);
                throw new Error('incorrect email and password combination');
            }

        });
};

accounts_client.prototype.updateUser = function (params) {

    return config.updateUser(params)
        .then(function (user) {
            return user;
        });
};

accounts_client.prototype.createAccount = function (params) {

    return config.createUser(params);

};

accounts_client.prototype.removeAccount = function (email) {

    // remove account after verifying user has permissions
    return config.deleteUser(email);
};


module.exports = new accounts_client();