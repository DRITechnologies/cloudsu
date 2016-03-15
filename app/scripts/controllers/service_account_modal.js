angular
    .module('stacks')
    .controller('service_account_modal', function ($scope, $http, $location, $modal, $modalInstance, dataStore, type, server, account) {
        $scope.alerts_modal = [];

        $scope.account = account;

        $scope.saveServiceAccount = function () {


            $scope.account.type = type;

            if (type === 'CMS') {
                $scope.account.name = 'CHEF';
            }

            $http.post('/api/v1/services/save_account', $scope.account)
                .success(function (res) {
                    if (!dataStore.getActiveAWS() && type === 'AWS') {
                        dataStore.setActiveAWS($scope.account.name);
                    }

                    $modalInstance.dismiss('cancel');
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
