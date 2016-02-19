// directives
stacks.directive('navbar', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/bars/navbar.html'
    };
});

stacks.directive('documentation', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/bars/footer_bar.html'
    };
});

stacks.directive('alerts', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/alerts.html'
    };
});


stacks.directive('alertsmodal', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/alerts_modal.html'
    };
});

stacks.directive('spinner', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/spinner.html'
    };
});