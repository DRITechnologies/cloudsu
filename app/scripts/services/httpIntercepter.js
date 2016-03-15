angular
    .module('stacks')
    .factory('httpRequestInterceptor', function (dataStore) {

        return {
            request: function (config) {
                config.headers.aws_account = dataStore.getActiveAWS() || '';
                config.headers.aws_region = dataStore.getActiveRegion() || '';
                config.headers.cms_name = dataStore.getCmsName() || '';
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
