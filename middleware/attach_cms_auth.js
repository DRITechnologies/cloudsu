/*jshint esversion: 6 */
'use strict';

const config = require('../config/config.js');

class AttachCmsAuth {
    constructor () {}

    run (req, res, next) {

        return config.getServiceAccount({
                name: 'CHEF',
                type: 'CMS'
            })
            .then(response => {
                req.cms = response;
                return next();
            });

    }
}


module.exports = new AttachCmsAuth();
