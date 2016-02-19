// view controllers
stacks.controller('stacks_controller', function ($scope, $http, $location, $modal, dataStore) {
    dataStore.setShowBurger(false);
    dataStore.setShowPlus(true);
    dataStore.setShowSpinner(true);


    //set short delay to ensure local storage is up to date

    $http.get('/api/v1/stacks')
        .success(function (res) {
            $scope.stacks = res.StackSummaries;
            dataStore.setShowSpinner(false);
        })
        .error(function (err) {
            dataStore.setShowSpinner(false);
        });

    $scope.openStack = function (stack_name) {
        dataStore.clearAlerts();
        $scope.alerts = [];
        dataStore.setStack(stack_name);
        $location.path('/stack/' + stack_name);
    };

    $scope.deleteStack = function ($event, stack_name) {
        $event.stopImmediatePropagation();
        bootbox.confirm('Are you sure you want to delete ' + stack_name + '?', function (
            result) {
            if (result) {
                $http.delete('/api/v1/stacks/' + stack_name)
                    .success(function (res) {
                        dataStore.addAlert('success', 'successfully deleted stack: ' + stack_name);
                    })
                    .error(function (res) {
                        dataStore.addAlert('danger', res.message);
                    });
            }
        });
    };


    $scope.rowColor = function (status) {
        switch (true) {
            case status.includes('DELETE_IN_PROGRESS'):
                return 'danger';
            case status.includes('ROLLBACK'):
                return 'warning';
            case status.includes('PROGRESS'):
                return 'success';
            case status.includes('FAILED'):
                return 'danger';
            default:
                return '';
        }
    };

    $scope.stack_status = function (status) {
        switch (true) {
            case status.includes('DELETE_IN_PROGRESS'):
                return 'fa fa-cloud';
            case status.includes('ROLLBACK'):
                return 'fa fa-cloud';
            case status.includes('PROGRESS'):
                return 'fa fa-ship';
            case status.includes('FAILED'):
                return 'fa fa-cloud';
            default:
                return 'fa fa-sun-o';
        }
    };


});