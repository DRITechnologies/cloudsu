/*jshint esversion: 6 */
'use strict';

const db = require('./utls/db.js');

let query = {
    range: 'DEFAULT',
    hash: 'AWS'
};

return db.find(query)
    .then(response => {
        console.log(response);
    });
