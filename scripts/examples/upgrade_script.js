var Promise = require('bluebird');
var retry = require('bluebird-retry');
var request = require('request');
var elb_perf = require('./elb_perf_mon.js');
Promise.promisifyAll(request);
request.async = Promise.promisify(request);
var jutha_api_base = "http://localhost:8080/api";
var stack_status = 'stack_status';
var service_status = 'service_status';
var stage1 = 'upgrade/stage1';
var stage2 = 'upgrade/stage2';
var stage3 = 'upgrade/stage3';
var stage4 = 'upgrade/stage4';
var db_migration = 'db_migrator/deploy';
var db_migration_prime = 'db_migrator/prime';

var retry_options = {
    interval: 10 * 1000,
    timeout: 15 * 60 * 1000
};

var auth = {
    user: '',
    pass: '',
    sendImmediately: true
};


function stage1_job(params) {
    console.log('started stage 1');
    var url = [jutha_api_base, stage1].join('/');
    return request.async({
            method: 'PATCH',
            url: url,
            auth: auth,
            json: true,
            body: params
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error("failed to start upgrade");
            }
            console.log('scale groups have been started successfully');
            return "success";
        });
}

function run_db_prime() {
    console.log('running migration');
    var url = [jutha_api_base, db_migration_prime].join('/');
    return request.async({
            method: 'POST',
            url: url,
            json: true,
            auth: auth,
            body: migration_params
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error(body);
            }
            console.log(params);
            return body;
        });

}

function wait_for_stack_job(params) {
    console.log('waiting for stack status of UPDATE_COMPLETE');
    var url = [jutha_api_base, stack_status, params.stack_name].join('/');
    return retry(function () {
        console.log('polling for stack success');
        return request.async({
                method: 'GET',
                url: url,
                auth: auth,
                json: true
            })
            .spread(function (response, body) {
                console.log(body);
                if (body === 'UPDATE_COMPLETE') {
                    return;
                } else if (body === 'UPDATE_IN_PROGRESS') {
                    throw new Error("Update in progress");
                } else {
                    throw new Error("Update rolled back");
                }
            });
    }, retry_options);
}

function wait_for_services_job(params) {
    console.log('waiting for services to listen');
    var url = [jutha_api_base, service_status, params.stack_name].join('/');
    return retry(function () {
        console.log('polling for service success');
        return request.async({
                method: 'GET',
                url: url,
                auth: auth,
                json: true
            })
            .spread(function (response, body) {
                console.log(body);
                if (body.status === 'SERVICES_READY') {
                    console.log('Services are now ready');
                    return;
                } else if (body.status === 'SERVICES_NOT_READY') {
                    throw new Error("Services not ready yet");
                } else {
                    throw new Error("Response that is unexpected");
                }
            });
    }, retry_options);
}

function stage2_job(params) {
    console.log('started stage 2');
    var url = [jutha_api_base, stage2].join('/');
    return request.async({
            method: 'PATCH',
            url: url,
            json: true,
            auth: auth,
            body: {
                stack_name: params.stack_name,
                restart_nginx: true,
                disconnect_all: true
            }
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error(body.error);
            }
            elb_perf.run(params);
            console.log(body.info);
            return body.status;
        });
}

function run_db_migration() {
    console.log('running migration');
    var url = [jutha_api_base, db_migration].join('/');
    return request.async({
            method: 'POST',
            url: url,
            json: true,
            auth: auth,
            body: migration_params
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error(body);
            }
            console.log(params);
            return body;
        });

}


function stage3_job(params) {
    console.log('starting stage 3');
    var url = [jutha_api_base, stage3].join('/');
    return request.async({
            method: 'PATCH',
            url: url,
            json: true,
            auth: auth,
            body: {
                stack_name: params.stack_name,
                connect_all: true
            }
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error(body.error);
            }
            console.log(body.info);
            return body.status;
        });

}

function stage4_job(params) {
    console.log('starting stage 4');
    var url = [jutha_api_base, stage4].join('/');
    return request.async({
            method: 'PATCH',
            url: url,
            json: true,
            auth: auth,
            body: {
                stack_name: params.stack_name,
                cleanup_type: params.cleanup_type
            }
        })
        .spread(function (response, body) {
            console.log(body);
            if (response.statusCode != 200) {
                throw new Error(body.error);
            }
            console.log(body.info);
            return body.status;
        });
}




return Promise.try(function (resolve, reject) {
        return stage1_job(params);
    })
    .then(function () {
        return run_db_prime();
    })
    .then(function () {
        return wait_for_stack_job(params);
    })
    .then(function () {
        return wait_for_services_job(params);
    })
    .then(function () {
        return stage2_job(params);
    })
    .then(function () {
        return run_db_migration();
    })
    .then(function () {
        return stage3_job(params);
    })
    .then(function () {
        return stage4_job(params);
    });
