stacks.controller('chef_controller', function ($scope, $http, dataStore, $modal) {

    dataStore.setShowBurger(false);
    dataStore.setShowPlus(false);
    dataStore.setShowSpinner(true);

    $http.get('/api/v1/environments')
        .success(function (response) {
            var keys = _.keys(response);
            $scope.environments = _.sortBy(keys);
            dataStore.setShowSpinner(false);
        })
        .error(function (err) {
            dataStore.setShowSpinner(false);
            dataStore.addAlert('danger', err.message);
        });

    $scope.openEnvironment = function (environment) {
        $http.get('/api/v1/' + environment + '/nodes')
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/chef_nodes.html',
                    controller: 'chef_nodes_controller',
                    size: 'lg',
                    resolve: {
                        nodes: function () {
                            return _.keys(response);
                        },
                        environment: function () {
                            return environment;
                        }
                    }
                });

            })
            .error(function (err) {
                dataStore.addAlert('danger', err.message);
            });
    };

    $scope.editEnvironment = function ($event, environment) {
        $event.stopImmediatePropagation();
        $http.get('/api/environment/' + environment)
            .success(function (environmentBody) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/env_editor.html',
                    controller: 'env_editor_modal',
                    size: 'lg',
                    resolve: {
                        environment: function () {
                            return environmentBody;
                        }
                    }
                });
            })
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.deleteEnvironment = function ($event, environment) {
        $event.stopImmediatePropagation();
        bootbox.confirm('Are you sure you want delete chef environment: ' + environment + '?', function (result) {
            if (result) {

                $http.delete('/api/v1/environment/' + environment)
                    .success(function (response) {
                        dataStore.addAlert('success', 'successfully deleted: ' + environment);
                    })
                    .error(function (err) {
                        dataStore.addAlert('danger', err.message);
                    });

            }
        });
    };
});