angular
    .module('stacks')
    .controller('groupResize', function($scope, $http, $uibModalInstance, stack_name,
        app_name, version, dataStore) {

        $scope.alerts = [];
        $scope.showSpinner = false;

        var params = {
            stack_name: stack_name,
            app_name: app_name,
            version: version
        };

        $scope.adjustSize = function() {
            $scope.showSpinner = true;
            params = _.extend(params, $scope.adjust);
            $http.patch('/api/v1/adjust_size', params)
                .success(function(response) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

    });
