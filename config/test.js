const secure = require('../config/secure_config');

const client_db = secure.get('db_client');

console.log(client_db);
