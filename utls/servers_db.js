/*jshint esversion: 6 */
'use strict';

const secure = require('../config/secure_config');

//get database creds from config
const db_cred = secure.get('db');
const dynasty = require('dynasty')(db_cred);
const logger = require('./logger.js');


//setup table connection
const db = dynasty.table('concord_servers');
logger.info('setup DynamoDB servers connection:', db_cred.region);

module.exports = db;
