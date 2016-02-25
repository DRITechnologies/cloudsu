stacks.controller('main_controller', function ($scope, $http, $location, $modal, dataStore) {

    $scope.alerts = dataStore.getAlerts();

    $http.get('/api/v1/ping/' + dataStore.getToken())
        .success(function (res) {
            if (!res.setup) {
                dataStore.setIsLogin(false);
                $location.path('/setup');
                return;
            } else if (!res.login) {
                dataStore.clearAll();
                dataStore.setIsLogin(false);
                $location.path('/login');
                return;
            }
            dataStore.setIsLogin(true);
        });

    $scope.showSpinner = function () {
        return dataStore.getShowSpinner();
    };

    //manipulates view
    $scope.isLogin = function () {
        return dataStore.getIsLogin();
    };

    $scope.close_alert = function (index) {
        $scope.alerts.splice(index, 1);
        dataStore.setAlerts($scope.alerts);
    };

});
