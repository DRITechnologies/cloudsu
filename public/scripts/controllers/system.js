stacks.controller('system', function ($scope, $http, $location, $modal, dataStore) {

    dataStore.setShowBurger(false);
    dataStore.setShowPlus(false);


    $http.get('/api/v1/services/get_accounts/CMS')
        .success(function (response) {
            $scope.chef_accounts = response;
        });

    $http.get('/api/v1/services/get_accounts/AWS')
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
                    return 'CMS';
                },
                server: function () {
                    return 'CHEF';
                },
                account: function () {
                    return false;
                }
            }
        });
    };

    $scope.getChefModal = function (name) {

        $http.get('/api/v1/services/get_account/CMS/' + name)
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/modals/chef.html',
                    controller: 'service_account_modal',
                    size: 'lg',
                    resolve: {
                        type: function () {
                            return 'CMS';
                        },
                        server: function () {
                            return 'CHEF';
                        },
                        account: function () {
                            return response;
                        }
                    }
                });

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
                    return 'AWS';
                },
                server: function () {
                    return '';
                },
                account: function () {
                    return false;
                }
            }
        });
    };

    $scope.getAwsModal = function (name) {
        $http.get('/api/v1/services/get_account/CMS/' + name)
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/modals/aws.html',
                    controller: 'service_account_modal',
                    size: 'lg',
                    resolve: {
                        type: function () {
                            return 'AWS';
                        },
                        server: function () {
                            return '';
                        },
                        account: function () {
                            return response;
                        }
                    }
                });
            });
    };


});
