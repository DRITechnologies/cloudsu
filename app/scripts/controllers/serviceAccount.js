angular
    .module('stacks')
    .controller('serviceAccount', function($scope, $http, $uibModalInstance, dataStore, _, account, type) {

        $scope.alerts = [];
        $scope.account = account || {};
        $scope.account.type = type;
        $scope.showSpinner = false;

        $scope.saveServiceAccount = function() {

            //show show spinner
            $scope.showSpinner = true;

            $http.post('/api/v1/services/save_account', $scope.account)
                .success(function(res) {
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
