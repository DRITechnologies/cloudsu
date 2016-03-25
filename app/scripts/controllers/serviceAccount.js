angular
    .module('stacks')
    .controller('serviceAccount', function($scope, $http, $uibModalInstance, dataStore, _, account, type) {

        $scope.alerts = [];

        console.log(type);

        $scope.account = account || {};
        $scope.account.type = type;

        $scope.saveServiceAccount = function() {

            $http.post('/api/v1/services/save_account', $scope.account)
                .success(function(res) {
                    $uibModalInstance.close(true);
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
