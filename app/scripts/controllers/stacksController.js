angular
    .module('stacks')
    .controller('stacksController', function($rootScope, $scope, $http, $state, $uibModal, SweetAlert, dataStore) {

        //Get stacks from AWS
        function refresh() {
            $http.get('/api/v1/stacks')
                .success(function(res) {
                    $scope.stacks = res.StackSummaries;
                });
        }

        //catch alerts from parent to refresh
        $scope.$on('refresh', function(e) {
            refresh();
        });

        $scope.openCreateForm = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/createForm.html',
                controller: 'createStack',
                size: 'md'
            });

            modalInstance.result.then(function(selectedItem) {
                //refresh service accounts
                refresh();
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        //Open stack detail view
        $scope.openStack = function(stack_name) {
            dataStore.setStack(stack_name);
            $state.go('/stack/' + stack_name);
        };

        //Delete stack but confirm first
        $scope.deleteStack = function($event, stack_name) {
            $event.stopImmediatePropagation();

            SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'All stack resources will be removed: ' + stack_name,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        $http.delete('/api/v1/stacks/' + stack_name)
                            .success(function(res) {
                                SweetAlert.swal('Success', stack_name + ' is being deprovisioned.', 'success');
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


        $scope.rowColor = function(status) {
            switch (true) {
                case status.includes('DELETE_IN_PROGRESS'):
                    return 'danger';
                case status.includes('ROLLBACK'):
                    return 'warning';
                case status.includes('PROGRESS'):
                    return 'success';
                case status.includes('FAILED'):
                    return 'danger';
                default:
                    return '';
            }
        };

        $scope.stackStatus = function(status) {
            switch (true) {
                case status.includes('DELETE_IN_PROGRESS'):
                    return 'fa fa-cloud';
                case status.includes('ROLLBACK'):
                    return 'fa fa-cloud';
                case status.includes('PROGRESS'):
                    return 'fa fa-ship';
                case status.includes('FAILED'):
                    return 'fa fa-cloud';
                default:
                    return 'fa fa-sun-o';
            }
        };

        $scope.isUpdating = function(status) {
            if (status.includes('PROGRESS')) {
                return true;
            } else {
                return false;
            }
        };

        //get initial data
        refresh();

    });
