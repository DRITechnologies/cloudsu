/**
 * MainCtrl - controller
 */
angular
    .module('stacks')
    .controller('MainCtrl', function ($scope, $http, $state, dataStore, SweetAlert) {

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

        //logout method
        $scope.logout = function () {
            dataStore.clearAll();
            $state.go('login');
        };

        //Get bear api token
        $scope.getToken = function () {
            $http.get('/api/v1/accounts/token')
            .success(function (token){
              SweetAlert.swal({
                title: 'Service API Token',
                text: token,
                type: 'success',
                confirmButtonColor: '#1ab394'});
            })
            .error(function (err) {
               console.log(err);
            });

        };

    });
