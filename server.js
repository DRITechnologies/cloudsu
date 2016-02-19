'use strict'

const cluster = require('cluster');
const express = require('express');
const app = express();
const logger = require('./utls/logger.js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const numCPUs = require('os').cpus().length;


// configuration =================
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(methodOverride());
app.use(morgan('combined', {
    "stream": logger.stream
}));


//setup router
require('./api/router.js')(app)

//start cleanup tool
//require('./utls/cleanup_tool.js');


if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {

    // listen (start app with node server.js) ======================================
    app.listen(8080, (err, response) => {
        if (err) {
            logger.info(err);
            return
        };
        logger.info('App listening on port 8080');
    });

}