/**
 * MainCtrl - controller
 */
angular
    .module('stacks')
    .controller('MainCtrl', function ($scope, $http, $state, dataStore) {

        this.userName = dataStore.getActiveUser();
        this.helloText = 'Concord Stacks';
        this.descriptionText = 'Click + to create a new stack!';

        $http.get('/api/v1/ping/' + dataStore.getToken())
            .success(function (res) {
                if (!res.login) {
                    dataStore.clearAll();
                    $state.go('login');
                    return;
                }
            });

        // close alert
        $scope.close_alert = function (index) {
            $scope.alerts.splice(index, 1);
            dataStore.setAlerts($scope.alerts);
        };

        //logout method
        $scope.logout = function () {
            dataStore.clearAll();
            $state.go('login');
        };

        //Get api token
        $scope.getToken = function () {
            console.log('getting token');
        };

    });
