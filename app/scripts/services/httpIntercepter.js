angular
    .module('stacks')
    .factory('httpRequestInterceptor', function(dataStore) {
        return {
            request: function(config) {
                config.headers.aws_account = dataStore.getActiveAWS() || 'DEFAULT';
                config.headers.aws_region = dataStore.getActiveRegion() || 'us-east-1';
                config.headers.token = dataStore.getToken() || '';
                return config;
            }
        };
    });

angular
    .module('stacks')
    .factory('httpResponseInterceptor', function(dataStore, $location) {
        return {
            responseError: function(err) {
                console.log(err);
                if (err.status === 401) {
                    $location.path('/login');
                }
                return [];
            }
        };
    });

angular
    .module('stacks')
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('httpResponseInterceptor');
        $httpProvider.interceptors.push('httpRequestInterceptor');
    });
