angular
    .module('stacks')
    .controller('systemAccount', function ($scope, $http, $location, $uibModalInstance, dataStore, _, account) {

        $scope.alerts = [];

        $scope.account = account;

        $scope.saveServiceAccount = function () {

            $http.post('/api/v1/services/save_account', $scope.account)
                .success(function (res) {
                    $uibModalInstance.dismiss('cancel');
                })
                .error(function (err) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close_alert_modal = function (index) {
            $scope.alerts_modal.splice(index, 1);
        };

    });
