angular
    .module('stacks')
    .factory('httpRequestInterceptor', function (dataStore) {

        return {
            request: function (config) {
                config.headers.aws_account = dataStore.getActiveAWS() || 'DEFAULT';
                config.headers.aws_region = dataStore.getActiveRegion() || 'us-west-2';
                config.headers.token = dataStore.getToken() || '';
                return config;
            }
        };
    });

angular
    .module('stacks')
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    });
