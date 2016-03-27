angular
    .module('stacks')
    .controller('stackRollback', function($scope, $http, $uibModalInstance, stack_name, dataStore) {
        $scope.alerts_modal = [];
        $scope.stack_name = stack_name;


        $http.get('/api/v1/chef/rollback_check/' + $scope.stack_name)
            .success(function(response) {
                $scope.rollback_available = response;
            })
            .error(function(err) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: err
                });
            });

        $scope.rollback = function() {
            $scope.showSpinner = true;
            $http.patch('/api/v1/upgrade/rollback', {
                    stack_name: $scope.stack_name
                })
                .success(function(response) {
                    $scope.showSpinner = false;
                    $uibModalInstance.dismiss('cancel');
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

        $scope.close_alert_modal = function(index) {
            $scope.alerts.splice(index, 1);
        };




    });
