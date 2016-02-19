var config = require('../config/config.js');

function attach_cms_auth() {}


attach_cms_auth.prototype.run = function (req, res, next) {

    var cms_name = req.headers.cms_name || req.body.cms_name;

    if (!cms_name || cms_name === 'empty') {
        return next();
    }

    var cms_obj = {};

    return config.getServiceAccount({
            name: cms_name,
            type: 'cms'
        })
        .then(function (response) {
            req.cms = response;
            return next();
        });

};


module.exports = new attach_cms_auth();