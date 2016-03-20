angular
    .module('stacks')
    .controller('loginController', function ($scope, $http, $state, $uibModal, dataStore) {
        //set default spinner action
        $scope.showSpinner = false;
        //remove all data in local storage
        dataStore.clearAll();
        $scope.alerts = [];


        $scope.attemptLogin = function () {

            //setup http body
            var user = {
                email: $scope.user.email,
                password: $scope.user.password
            };

            //display spinner while authenticating
            $scope.showSpinner = true;

            $http.post('/api/v1/accounts/login', user)
                .success(function (user) {
                    //stop spinnner
                    $scope.showSpinner = false;

                    //load settings for user
                    dataStore.setToken(user.token);
                    dataStore.setActiveUser(user.name);
                    dataStore.setActiveAWS(user.aws_account);
                    dataStore.setActiveRegion(user.aws_region);
                    $state.go('index.main');
                })
                .error(function (err) {
                    //stop spinnner and present error
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });

        };

        $scope.closeAlert = function (index) {
            //remove alert at index
            $scope.alerts.splice(index, 1);
        };

        $scope.setup = function () {
            //only show setup modal if it has not run before
            $http.get('/api/v1/ping/' + dataStore.getToken())
                .success(function (res) {
                    if (!res.setup) {
                        dataStore.setIsLogin(false);
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'views/setup.html',
                            controller: 'setup',
                            size: 'md',
                            resolve: {
                                items: function () {
                                    return $scope.items;
                                }
                            }
                        });
                    } else {
                        //add alert to show that the system has already been setup
                        $scope.alerts.push({
                            type: 'danger',
                            msg: 'System has already been setup'
                        });
                    }
                });
        };


    });