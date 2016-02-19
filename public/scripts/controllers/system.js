stacks.controller('system', function ($scope, $http, $location, $modal, dataStore) {

    dataStore.setShowBurger(false);
    dataStore.setShowPlus(false);


    $http.get('/api/v1/services/get_accounts/chef')
        .success(function (response) {
            $scope.chef_accounts = response;
        });

    $http.get('/api/v1/services/get_accounts/aws')
        .success(function (response) {
            $scope.aws_accounts = response;
        });

    //open chef modal
    $scope.chefModal = function () {
        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/chef.html',
            controller: 'service_account_modal',
            size: 'lg',
            resolve: {
                type: function () {
                    return 'cms';
                },
                server: function () {
                    return 'chef';
                }
            }
        });
    };

    $scope.awsModal = function () {
        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/aws.html',
            controller: 'service_account_modal',
            size: 'lg',
            resolve: {
                type: function () {
                    return 'aws';
                }
            }
        });
    };


});