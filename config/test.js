var config = require('./config.js');
var chef_client = require('../api/clients/chef_client.js');




return config.getServiceAccount({
        name: 'Dev',
        type: 'cms'
    })
    .then(function (response) {
        chef_client.init(response);

        var params = {
            stack_name: 'testing',
            app_name: 'api',
            version: '4552'
        };


        return chef_client.getEnvironmentNodes('prodnode')
            .then(function (response) {
                console.log('testing', response);
            });
    });