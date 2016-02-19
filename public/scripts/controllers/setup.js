stacks.controller('setup', function ($scope, $http, $location, $modal, dataStore) {
    $scope.showSpinner = false;
    $scope.alerts = [];

    $http.get('/api/v1/regions')
        .success(function (regions) {
            $scope.regions = regions;
        });

    $http.get('/api/v1/bucket_regions')
        .success(function (bucket_regions) {
            $scope.bucket_regions = bucket_regions;
        });

    $scope.create = function () {
        $scope.account.aws.type = 'aws';
        $scope.account.user.type = 'user';
        if ($scope.account.user.password !== $scope.account.user.confirm) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Passwords do not match'
            });
            return;
        }
        $scope.showSpinner = true;
        $http.post('/api/v1/setup/' + $scope.account.aws.name, $scope.account)
            .success(function (response) {
                $scope.showSpinner = false;
                dataStore.setToken(response.token);
                dataStore.setActiveAWS($scope.account.aws.name);
                dataStore.setActiveRegion($scope.account.aws.region);
                $location.path('/login');
            })
            .error(function (err) {
                $scope.showSpinner = false;
                $scope.alerts.push({
                    type: 'danger',
                    msg: err.cause.message
                });
            });
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts.splice(index, 1);
    };


});