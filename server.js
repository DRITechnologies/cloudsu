/*jshint esversion: 6 */
'use strict'

const cluster = require('cluster');
const express = require('express');
const app = express();
const logger = require('./utls/logger.js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const numCPUs = require('os').cpus().length;

// determine listening port
const listenPort = process.env.CONCORD_PORT || 3000;


// express configuration
app.use(express.static(`${__dirname}/dist`));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(methodOverride());
app.use(morgan('combined', {
    'stream': logger.stream
}));


//setup api router
require('./api/router.js')(app)



if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    //init functions that only run on master
    //queue rider (looks for new server messages in sqs)
    require('./utls/queue_rider.js');

    //start cleanup tool (cleans up expired resources)
    //require('./utls/cleanup_tool.js');
} else {

    // listen
    app.listen(listenPort, (err, response) => {
        if (err) {
            logger.info(err);
            return
        };
        logger.info(`App listening on port ${listenPort}`);
    });

}
