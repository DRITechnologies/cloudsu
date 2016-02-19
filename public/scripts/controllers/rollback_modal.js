stacks.controller('rollback_modal', function ($scope, $http, $modalInstance, stack_name, dataStore) {
    $scope.alerts_modal = [];
    $scope.stack_name = stack_name;


    $http.get('/api/v1/chef/rollback_check/' + $scope.stack_name)
        .success(function (response) {
            $scope.rollback_available = response;
        })
        .error(function (res) {
            $scope.alerts_modal.push({
                type: 'danger',
                msg: res.message
            });
        });

    $scope.rollback = function () {
        $scope.showSpinner = true;
        $http.patch('/api/v1/upgrade/rollback', {
                stack_name: $scope.stack_name
            })
            .success(function (response) {
                $scope.showSpinner = false;
                dataStore.addAlert('success', 'successfully rolled stack back');
                $modalInstance.dismiss('cancel');
            })
            .error(function (res) {
                $scope.showSpinner = false;
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };


});