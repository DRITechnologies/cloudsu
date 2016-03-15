angular
    .module('stacks')
    .controller('setup', function ($scope, $http, $state, dataStore) {
        $scope.showSpinner = false;
        $scope.alerts = [];

        $http.get('/api/v1/regions')
            .success(function (regions) {
                $scope.regions = regions;
            });

        $scope.create = function () {
            $scope.account.aws.type = 'AWS';
            $scope.account.aws.name = 'DEFAULT';
            $scope.account.cms.type = 'CMS';
            $scope.account.cms.name = 'DEFAULT';
            $scope.account.cms.server = 'CHEF';
            $scope.account.user.type = 'USER';

            if ($scope.account.user.password !== $scope.account.user.confirm) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'Passwords do not match'
                });
                return;
            }

            console.log($scope.account);

            $scope.showSpinner = true;
            $http.post('/api/v1/setup/' + $scope.account.aws.name, $scope.account)
                .success(function (response) {
                    $scope.showSpinner = false;
                    dataStore.setToken(response.token);
                    dataStore.setActiveAWS($scope.account.aws.name);
                    dataStore.setActiveRegion($scope.account.aws.region);
                    $state.go('/login');
                })
                .error(function (err) {
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.close_alert = function (index) {
            $scope.alerts.splice(index, 1);
        };

    });
