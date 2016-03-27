angular
    .module('stacks')
    .controller('groupResize', function($scope, $http, $uibModalInstance, stack_name,
        app_name, version, dataStore) {
        $scope.alerts_modal = [];

        var params = {
            stack_name: stack_name,
            app_name: app_name,
            version: version
        };

        $scope.adjustSize = function() {
            params = _.extend(params, $scope.adjust);
            $http.patch('/api/v1/adjust_size', params)
                .success(function(response) {
                    $uibModalInstance.dismiss('cancel');
                })
                .error(function(err) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close_alert_modal = function(index) {
            $scope.alerts_modal.splice(index, 1);
        };



    });
