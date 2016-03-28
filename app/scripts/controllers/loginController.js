angular
    .module('stacks')
    .controller('loginController', function($rootScope, $scope, $http, $state, $uibModal, dataStore) {
        //set default spinner action
        $scope.showSpinner = false;
        //remove all data in local storage
        dataStore.clearAll();
        $scope.alerts = [];


        $scope.attemptLogin = function() {
            // return if empty form
            if (!$scope.user) {
                return;
            }

            // setup http body
            var user = {
                name: $scope.user.name,
                password: $scope.user.password
            };

            //display spinner while authenticating
            $scope.showSpinner = true;

            $http.post('/api/v1/accounts/login', user)
                .success(function(user) {
                    //stop spinnner
                    $scope.showSpinner = false;

                    //save user settings in localstorage
                    dataStore.setToken(user.token);
                    dataStore.setActiveUser(user.name);
                    dataStore.setActiveAWS(user.aws_account);
                    dataStore.setActiveRegion(user.aws_region);

                    //set parent values because they will not reload
                    if (user.aws_account) {
                        $scope.$parent.activeAws = user.aws_account;
                    }
                    if (user.aws_region) {
                        $scope.$parent.activeRegion = user.aws_region;
                    }
                    if (user.name) {
                        $scope.$parent.userName = user.name;
                    }

                    $state.go('index.stacks');
                })
                .error(function(err) {
                    //stop spinnner and present error
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });

        };

        $scope.setup = function() {
            //only show setup modal if it has not run before
            $http.get('/api/v1/ping/' + dataStore.getToken())
                .success(function(res) {
                    if (!res.setup) {
                        dataStore.setIsLogin(false);
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'views/setup.html',
                            controller: 'setup',
                            size: 'md',
                            resolve: {
                                items: function() {
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

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


    });
