stacks.controller('login_controller', function ($scope, $http, $location, $modal, dataStore) {

    $scope.showSpinner = false;
    dataStore.clearAll();
    $scope.alerts = [];


    $scope.attemptLogin = function () {
        var user = {
            email: $scope.user.email,
            password: $scope.user.password
        };

        $scope.showSpinner = true;

        $http.post('/api/v1/users/login', user)
            .success(function (user) {

                console.log('token in login', user.token);

                //load settings for user
                dataStore.setToken(user.token);
                dataStore.setIsLogin(true);
                dataStore.setActiveUser(user.name);
                dataStore.setActiveAWS(user.aws_account);
                dataStore.setActiveRegion(user.aws_region);
                dataStore.setCmsName(user.cms_name);
                $location.path('/');
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

    $scope.close_alert = function (index) {
        $scope.alerts.splice(index, 1);
    };



});
