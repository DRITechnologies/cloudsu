angular
    .module('stacks')
    .controller('createStack', function ($scope, $http, $state, $uibModalInstance, dataStore) {

        $scope.alerts = [];
        $scope.advanced = false;
        $scope.stack = {};
        $scope.stack.instance_store = false;
        $scope.stack.ebs_volume = false;
        $scope.stack.multi_az = false;
        $scope.stack.elb = {};
        $scope.stack.type = 'create';
        $scope.stack.ebs_root_size = 30;
        $scope.showSpinner = false;
        $scope.stack.volumes = [];

        $http.get('/api/v1/ec2/sample/images')
            .success(function (response) {
                $scope.images = response;
            });

        $http.get('/api/v1/ec2/sizes')
            .success(function (res) {
                $scope.instanceSizes = res;
            });


        $http.get('/api/v1/iam/ssl')
            .success(function (res) {
                $scope.ssls = res;
            });

        $http.get('/api/v1/ec2/keys')
            .success(function (res) {
                console.log(res);
                $scope.keys = res;
            });

        $http.get('/api/v1/iam/roles')
            .success(function (res) {
                $scope.roles = res;
            });

        $http.get('/api/v1/region_map')
            .success(function (response) {
                $scope.regions = response;
            });


        $scope.createStack = function () {
            $scope.showSpinner = true;
            $scope.stack.update_list = [];

            var app_obj = {
                app_name: $scope.stack.app_name,
                version: $scope.stack.app_version
            };

            if ($scope.stack.build_size === 'HA') {
                $scope.stack.update_list.push(app_obj);
            }

            //add all az's from region if true
            if ($scope.stack.multi_az) {
                $scope.stack.regions = $scope.regions;
            } else {
                $scope.stack.regions = [$scope.stack.regions];
            }


            //convert instance group strings to array
            if ($scope.stack.instance_groups_string) {
                $scope.stack.security_groups = $scope.stack.instance_groups_string.replace(/ /g, '')
                    .split(',');
            } else {
                $scope.stack.security_groups = [];
            }

            //convert elb security group string to array
            if ($scope.stack.elb_groups_string) {
                $scope.stack.elb_security_groups = $scope.stack.elb_groups_string.replace(/ /g, '')
                    .split(',');
            } else {
                $scope.stack.elb_security_groups = [];
            }

            //convert recipe string to array
            if ($scope.stack.recipes_string) {
                $scope.stack.recipes = $scope.stack.recipes_string.replace(/ /g, '')
                    .split(',');
            } else {
                $scope.stack.recipes = [];
            }

            // check for alphas
            if (!$scope.stack.stack_name || $scope.stack.stack_name.match(/[^0-9a-z]/i)) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: 'AWS only allows Alphanumeric characters for stack names'
                });
                $scope.showSpinner = false;
                return;
            }

            console.log($scope.stack);

            var url = ['/api/v1/stacks/', $scope.stack.stack_name].join('');
            // create new stack
            $http.post(url, $scope.stack)
                .success(function (res) {
                    $scope.showSpinner = false;
                    $uibModalInstance.dismiss('cancel');
                    $state.go('main');
                })
                .error(function (err) {
                    $scope.showSpinner = false;
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        // close modal instance
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        // close alert
        $scope.close_alert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        // adds volume from the form
        $scope.addVolume = function () {
            $scope.stack.volumes.push({
                type: 'gp2',
                size: 30
            });
        };

        // removes a volume from the form
        $scope.removeVolume = function (index) {
            $scope.stack.volumes.splice(index, 1);
        };



    });
