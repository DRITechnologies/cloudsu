angular
    .module('stacks')
    .controller('system', function($scope, $http, $uibModal, dataStore, SweetAlert) {

        $scope.alerts = [];

        //to make the ui render correctly
        $scope.admin = true;

        // refresh aws accounts
        function refresh() {
            $http.get('/api/v1/services/get_accounts/AWS')
                .success(function(response) {
                    $scope.admin = true;
                    $scope.aws_accounts = response;
                })
                .error(function(err) {
                    $scope.admin = false;
                });
        }

        //open modal to edit chef
        $scope.chefModal = function() {
            $http.get('/api/v1/services/get_account/CMS/DEFAULT')
                .success(function(response) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/chef.html',
                        size: 'md',
                        controller: 'serviceAccount',
                        resolve: {
                            account: function() {
                                return response;
                            },
                            type: function() {
                                return 'CMS';
                            }
                        }
                    });

                });
        };

        // open aws account modal
        $scope.awsModal = function(account) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/aws.html',
                size: 'md',
                controller: 'serviceAccount',
                resolve: {
                    account: function() {
                        return account;
                    },
                    type: function() {
                        return 'AWS';
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                //refresh stacks to show newly created stack
                refresh();
            });
        };

        // remove service account
        $scope.removeAccount = function(account) {
            SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'Account will be removed: ' + account.name,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        $http.delete(['/api/v1/services', account.type, account.name].join('/'))
                            .success(function(response) {
                                SweetAlert.swal('Success', account.name + ' has been removed.', 'success');
                                refresh();
                            })
                            .error(function(err) {
                                $scope.alerts.push({
                                    type: 'danger',
                                    msg: err
                                });
                            });
                    }
                });
        };


        // load initial data
        refresh();


    });
