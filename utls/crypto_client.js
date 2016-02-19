var bcrypt = require('bcrypt');
var crypto = require('crypto');
var algorithm = 'aes256';
var key = 'gbXQ2y+8cpl63n&';

function crypto_client() {}

crypto_client.prototype.encrypt = function (password) {

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash;

};

crypto_client.prototype.check_password = function (hash, password) {

    //check password against hash from DB
    return bcrypt.compareSync(password, hash);

};

crypto_client.prototype.encrypt_string = function (string) {
    var cipher = crypto.createCipher(algorithm, key);
    return cipher.update(string, 'utf8', 'hex') + cipher.final('hex');
};

crypto_client.prototype.decrypt_string = function (string) {
    return new Promise(function (resolve, reject) {
        var decipher = crypto.createDecipher(algorithm, key);
        var result = decipher.update(string, 'hex', 'utf8') + decipher.final('utf8');
        return resolve(result);
    });
};

module.exports = new crypto_client();