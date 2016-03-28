angular
    .module('stacks')
    .controller('resetPassword', function($scope, $http, $state, $uibModalInstance) {

        $scope.alerts = [];


        $scope.save = function() {
            if ($scope.user.password !== $scope.user.confirm) {
                return $scope.alerts.push({
                    type: 'danger',
                    msg: 'Passwords do not match'
                });
            } else if ($scope.user.password < 8) {
                return $scope.alerts.push({
                    type: 'danger',
                    msg: 'Passwords must be at least 8 characters'
                });
            }

            $http.put('/api/v1/accounts/reset', $scope.user)
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

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });
