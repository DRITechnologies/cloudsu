var secure = require('../config/secure_config');
var logger = require('./logger.js');
var db_cred = secure.get('db');
var dynasty = require('dynasty')(db_cred);


//setup table connection
var db = dynasty.table('concord');
logger.info('setup DynamoDB connection:', db_cred.region);

module.exports = db;