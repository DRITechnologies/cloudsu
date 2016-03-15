angular
    .module('stacks')
    .controller('adjust_size_modal', function ($scope, $http, $modalInstance, stack_name,
        app_name, version, dataStore) {
        $scope.alerts_modal = [];

        var params = {
            stack_name: stack_name,
            app_name: app_name,
            version: version
        };

        $scope.adjustSize = function () {
            params = _.extend(params, $scope.adjust);
            $http.patch('/api/v1/adjust_size', params)
                .success(function (response) {
                    $modalInstance.dismiss('cancel');
                    dataStore.addAlert('success', 'successfully adjusted scale group size');
                })
                .error(function (err) {
                    $scope.alerts_modal.push({
                        type: 'danger',
                        msg: err
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
