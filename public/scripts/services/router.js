// configure our routes
stacks.config(function ($routeProvider) {
    $routeProvider
    // route for the home page
        .when('/', {
            templateUrl: 'partials/pages/stacks.html',
            controller: 'stacks_controller'
        })
        .when('/setup', {
            templateUrl: 'partials/pages/setup.html',
            controller: 'setup'
        })
        // route for detail of stack
        .when('/stack/:stack_name', {
            templateUrl: 'partials/pages/stack.html',
            controller: 'stack_controller'
        })
        .when('/system', {
            templateUrl: 'partials/pages/system.html',
            controller: 'system'
        })
        .when('/login', {
            templateUrl: 'partials/pages/login.html',
            controller: 'login_controller'
        });
});
