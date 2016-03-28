angular
    .module('stacks')
    .controller('upgradeStack', function($scope, $http, $uibModalInstance, stack_name, dataStore) {

        $scope.alerts = [];
        $scope.advanced = false;
        $scope.stack = {};
        $scope.stack.apps = [];
        $scope.stack.type = 'upgrade';
        $scope.stack.stack_name = stack_name;
        $scope.showSpinner = false;
        $scope.upgrade_options = true;


        $http.get('/api/v1/ec2/sizes')
            .success(function(response) {
                $scope.instanceSizes = response;
            });

        $http.get('/api/v1/chef/environments/' + stack_name)
            .success(function(response) {

                var defaults = response.default_attributes;
                if (defaults) {
                    var chef = defaults.concord_params;
                    $scope.stack.min_size = chef.min_size;
                    $scope.stack.desired_size = chef.desired_size;
                    $scope.stack.max_size = chef.max_size;
                    $scope.current_version = chef.app_version;
                    $scope.stack.ami = chef.ami;
                    $scope.stack.instance_size = chef.instance_size;
                    $scope.stack.app_name = chef.app_name;
                    $scope.stack.update_list = chef.update_list;
                }

            });

        $scope.upgrade = function() {

            $scope.stack.update_list = [{
                app_name: $scope.stack.app_name,
                version: $scope.stack.app_version
            }];

            $scope.showSpinner = true;
            $http.patch('/api/v1/upgrade', $scope.stack)
                .success(function(data) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };


        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    });
