function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/index/main');

    $stateProvider

        .state('setup', {
            url: '/setup',
            templateUrl: 'views/setup.html',
            controller: 'setup'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('index', {
            abstract: true,
            url: '/index',
            templateUrl: 'views/common/content.html',
        })
        .state('index.main', {
            url: '/main',
            templateUrl: 'views/main.html',
            controller: 'stacksController'
        })
        .state('index.users', {
            url: '/users',
            templateUrl: 'views/minor.html'
        })
        .state('index.system', {
            url: '/system',
            templateUrl: 'views/system.html'
        });
}
angular
    .module('stacks')
    .config(config)
    .run(function ($rootScope, $state) {
        $rootScope.$state = $state;
    });
