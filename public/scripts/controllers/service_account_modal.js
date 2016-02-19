stacks.controller('service_account_modal', function ($scope, $http, $location, $modal, $modalInstance, dataStore, type, server) {
    $scope.alerts_modal = [];

    $scope.saveServiceAccount = function () {

        if (type === 'cms') {
            $scope.account.server = server;
        }

        $scope.account.type = type;

        $http.post('/api/v1/services/save_account', $scope.account)
            .success(function (res) {
                if (!dataStore.getActiveAWS() && type === 'aws') {
                    console.log('setting active account:', $scope.account.name);
                    dataStore.setActiveAWS($scope.account.name);
                } else if (type === 'cms') {
                    dataStore.setCmsName($scope.account.name);
                    dataStore.setCmsType('cms');
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