// view controllers
angular
    .module('stacks')
    .controller('stacksController', function ($scope, $http, $state, $uibModal, $ngBootbox, dataStore) {

        //Get stacks from AWS
        function refresh() {
            $http.get('/api/v1/stacks')
                .success(function (res) {
                    $scope.stacks = res.StackSummaries;
                });
        }

        $scope.openCreateForm = function () {
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/modals/createForm.html',
                controller: 'createStack',
                size: 'md',
                resolve: {}
            });
        };

        //Open stack detail view
        $scope.openStack = function (stack_name) {
            dataStore.setStack(stack_name);
            $state.go('/stack/' + stack_name);
        };

        //Delete stack but confirm first
        $scope.deleteStack = function ($event, stack_name) {
            $event.stopImmediatePropagation();
            $ngBootbox.confirm('Are you sure you want to delete ' + stack_name + '?')
                .then(function () {
                    $http.delete('/api/v1/stacks/' + stack_name)
                        .success(function (res) {
                            refresh();
                        })
                        .error(function (err) {
                            $scope.alerts.push({
                                type: 'danger',
                                msg: err
                            });
                        });
                });
        };


        $scope.rowColor = function (status) {
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

        $scope.stackStatus = function (status) {
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

        $scope.isUpdating = function (status) {
            if (status.includes('PROGRESS')) {
                return true;
            } else {
                return false;
            }
        };

        //get initial data
        refresh();

    });
