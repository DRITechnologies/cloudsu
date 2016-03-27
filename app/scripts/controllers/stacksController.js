angular
    .module('stacks')
    .controller('stacksController', function($rootScope, $scope, $http, $state, $uibModal, SweetAlert, dataStore) {

        // set refreshCount
        var refreshCount = 0;

        //Get stacks from AWS
        function refresh() {
            console.log('refreshing data');
            $http.get('/api/v1/stacks')
                .success(function(res) {
                    $scope.stacks = res.StackSummaries;
                });
        }

        function refreshRetry(iterations) {
            // refresh every 10 seconds for interval
            setTimeout(function() {
                if (refreshCount < iterations) {
                    refresh();
                    refreshRetry(iterations);
                    refreshCount++;
                }
            }, 10000);
        }

        //catch alerts from parent to refresh
        $scope.$on('refresh', function() {
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
                refreshRetry(50);
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        //Open stack detail view
        $scope.openStack = function(stack_name) {
            console.log('clicked open stack', stack_name);
            dataStore.setStack(stack_name);
            $state.go('index.detail', {
                stack_name: stack_name
            });
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
                                refreshRetry(30);
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


        $scope.panelColor = function(status) {
            switch (true) {
                case status.includes('DELETE_IN_PROGRESS'):
                    return 'panel panel-danger';
                case status.includes('ROLLBACK'):
                    return 'panel panel-warning';
                case status.includes('PROGRESS'):
                    return 'panel panel-info';
                case status.includes('FAILED'):
                    return 'panel panel-danger';
                default:
                    return 'panel panel-primary';
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
