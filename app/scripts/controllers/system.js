angular
    .module('stacks')
    .controller('system', function ($scope, $http, $location, $uibModal, dataStore) {

        $scope.alerts = [];

        //to make the ui render correctly
        $scope.admin = true;

        function refresh() {
            $http.get('/api/v1/services/get_accounts/AWS')
                .success(function (response) {
                    $scope.admin = true;
                    $scope.aws_accounts = response;
                })
                .error(function (err) {
                    $scope.admin = false;
                });
        }

        //open modal to edit chef
        $scope.chefModal = function () {

            $http.get('/api/v1/services/get_account/CMS/DEFAULT')
                .success(function (response) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/chef.html',
                        size: 'md',
                        controller: 'systemAccount',
                        resolve: {
                            account: function () {
                                return response;
                            }
                        }
                    });

                });
        };

        $scope.awsModal = function (account) {
            $scope.aws = account;
            $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/aws.html',
                size: 'md',
                controller: 'systemAccount',
                resolve: {
                    account: function () {
                        return account;
                    }
                }
            });
        };


        // load initial data
        refresh();


    });
