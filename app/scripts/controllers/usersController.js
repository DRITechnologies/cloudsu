angular
    .module('stacks')
    .controller('usersController', function ($scope, $http, $state, $uibModal, dataStore) {

         $http.get('api/v1/accounts/')
         .success(function (users) {
             $scope.users = users;
         })
         .error(function (err) {
             console.log(err);
         });

    });
