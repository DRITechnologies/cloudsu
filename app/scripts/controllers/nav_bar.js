angular
    .module('stacks')
    .controller('nav_bar', function ($scope, $http, $location, $modal, dataStore) {
        $scope.alerts_modal = [];


        //set active account info
        $scope.active_user = dataStore.getActiveUser();
        $scope.active_aws_region = dataStore.getActiveRegion();
        $scope.active_aws_account = dataStore.getActiveAWS();

        $scope.openEditor = function () {
            $scope.stack_name = dataStore.getStack();
            $http.get('/api/v1/stacks/template/' + $scope.stack_name)
                .success(function (response) {
                    $scope.template = response;
                    $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'partials/modals/env_editor.html',
                        controller: 'stack_editor_modal',
                        size: 'lg',
                        resolve: {
                            template: function () {
                                return $scope.template;
                            },
                            stack_name: function () {
                                return $scope.stack_name;
                            }
                        }
                    });
                })
                .error(function (err) {
                    $scope.alerts_modal.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.openEnvEditor = function () {
            $scope.stack_name = dataStore.getStack();
            $http.get('/api/v1/chef/environments/' + $scope.stack_name)
                .success(function (response) {
                    $scope.environment = response;
                    $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'partials/modals/env_editor.html',
                        controller: 'env_editor_modal',
                        size: 'lg',
                        resolve: {
                            environment: function () {
                                return $scope.environment;
                            },
                            stack_name: function () {
                                return $scope.stack_name;
                            }
                        }
                    });
                })
                .error(function (err) {
                    $scope.alerts_modal.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.home = function () {
            $location.path('/');
        };


        $scope.openSystem = function () {
            $location.path('/system');
        };

        $scope.openUpgradeForm = function () {
            $scope.stack_name = dataStore.getStack();
            $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'partials/modals/upgrade_form.html',
                controller: 'upgrade_modal',
                size: 'lg',
                resolve: {
                    stack_name: function () {
                        return $scope.stack_name;
                    }
                }
            });
        };


        $scope.rollback = function () {
            $scope.stack_name = dataStore.getStack();
            $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'partials/modals/rollback_form.html',
                controller: 'rollback_modal',
                size: 'md',
                resolve: {
                    stack_name: function () {
                        return $scope.stack_name;
                    }
                }
            });
        };


        $scope.showBurger = function () {

            return dataStore.getShowBurger();
        };

        $scope.showPlus = function () {

            return dataStore.getShowPlus();
        };

        $scope.openCreateForm = function () {
            $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'partials/modals/create_form.html',
                controller: 'create_stack_modal',
                size: 'lg',
                resolve: {}
            });
        };

        $scope.deleteStack = function () {
            $scope.stack_name = dataStore.getStack();
            bootbox.confirm('Are you sure you want to delete ' + $scope.stack_name + '?', function (
                result) {
                if (result) {
                    $http.delete('/api/v1/stacks/' + $scope.stack_name)
                        .success(function (res) {
                            $location.path('/');
                            dataStore.addAlert('success', 'successfully deleted stack: ' + $scope.stack_name);
                        })
                        .error(function (err) {
                            $location.path('/');
                        });
                }
            });
        };

        $scope.logout = function () {
            dataStore.clearAll();
            $location.path('/login');
        };


        $scope.close_alert_modal = function (index) {
            $scope.alerts_modal.splice(index, 1);
        };


    });
