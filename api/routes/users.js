var users_client = require('../clients/users_client.js');
var token_client = require('../../utls/token.js');
var secure_config = require('../../config/secure_config.js');

function accounts() {}

accounts.prototype.attemptLogin = function (req, res) {
    var params = req.body;
    return users_client.checkPassword(params.email, params.password)
        .then(function (user) {
            res.status(200).json(user);
        })
        .catch(function (err) {
            res.status(401).json(err);
        });
};

accounts.prototype.updateUser = function (req, res) {
    var params = req.body;
    return users_client.updateUser(params)
        .then(function (user) {
            res.status(200).json(user);
        })
        .catch(function (err) {
            res.status(500).json(err);
        });
};

accounts.prototype.checkToken = function (req, res) {

    var token = req.params.token;
    var db = secure_config.get('db');

    if (!db) {
        res.status(200).json({
            login: false,
            setup: false
        });
        return;
    }

    if (!token) {
        res.status(200).json({
            login: false,
            setup: true
        });
        return;
    }

    return token_client.verify(token)
        .then(function (response) {
            res.status(200).json({
                login: true,
                setup: true
            });
        })
        .catch(function (err) {
            res.status(200).json({
                login: false,
                setup: true
            });
        });

};

module.exports = new accounts();