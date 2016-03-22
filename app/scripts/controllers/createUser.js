angular
    .module('stacks')
    .controller('createUser', function ($scope, $http, $state, $uibModalInstance, dataStore, _) {

        // setup defaults
        $scope.alerts = [];
        $scope.token = false;
        $scope.user = {};
        $scope.user.type = 'USER';
        $scope.user.email_pass = false;
        $scope.showSpinner = false;

        $scope.create = function () {

            //ensure password match
            if ($scope.user.password !== $scope.user.confirm &&
                $scope.user.user_type === 'User' &&
                !$scope.user.email_pass) {
                return $scope.alerts.push({
                    type: 'danger',
                    msg: 'Passwords do not match'
                });
                // ensure password is at least 8 characters
            } else if ($scope.user.user_type === 'Service') {
                //stub so password length is not hit when it is not used
            } else if ($scope.user.password.length < 8 &&
                $scope.user.user_type === 'User' &&
                !$scope.user.email_pass) {
                return $scope.alerts.push({
                    type: 'danger',
                    msg: 'Passwords must be at least 8 characters'
                });
            }

            //start spinner
            $scope.showSpinner = true;

            // send create request
            $http.post('/api/v1/accounts', $scope.user)
                .success(function (response) {
                    $scope.showSpinner = false;
                    console.log(response);
                    if (response.service_token) {
                        $scope.token = response.service_token;
                    } else {
                        $uibModalInstance.close('success');
                    }
                })
                .error(function (err) {
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };


        $scope.cancel = function () {
            $uibModalInstance.close('success');
        };

    });
