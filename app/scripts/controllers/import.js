angular
    .module('stacks')
    .controller('import', function($scope, $http, $uibModalInstance) {
        console.log('opened');
        $scope.showSpinner = false;
        $scope.alerts = [];


        $scope.importConfig = function() {
            $scope.showSpinner = true;
            if (!$scope.config) {
                $scope.showSpinner = true;
                return;
            }
            $http.post('/api/v1/system/import', $scope.config)
                .success(function(response) {
                    $scope.showSpinner = true;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = true;
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
