angular
    .module('stacks')
    .controller('createStack', function ($scope, $http, $state, $uibModalInstance, dataStore, _) {

        $scope.alerts = [];
        $scope.sgs = [];
        $scope.elb_sgs = [];
        $scope.stack = {};
        $scope.stack.instance_store = false;
        $scope.stack.ebs_volume = false;
        $scope.stack.multi_az = false;
        $scope.stack.elb = {};
        $scope.stack.type = 'create';
        $scope.stack.ebs_root_size = 30;
        $scope.showSpinner = false;
        $scope.stack.volumes = [];
        $scope.stack.recipes = [];
        $scope.stack.update_list = [];

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

        $http.get('/api/v1/ec2/security_groups')
            .success(function (response) {
                console.log(response);
                $scope.security_groups = response;
            });

        $http.get('/api/v1/chef/recipes')
            .success(function (response) {
                console.log(response);
                $scope.recipes = response;
            });


        $scope.createStack = function () {
            $scope.showSpinner = true;

            // check for alphas
            if (!$scope.stack.stack_name || $scope.stack.stack_name.match(/[^0-9a-z]/i)) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'AWS only allows Alphanumeric characters for stack names'
                });
                $scope.showSpinner = false;
                return;
            }

            //convert recipe string to array
            if ($scope.stack.recipes_string) {
                $scope.stack.recipes = $scope.stack.recipes_string.replace(/ /g, '')
                    .split(',');
            } else {
                $scope.stack.recipes = [];
            }

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

            //pluck just the sg id
            $scope.stack.elb_security_groups = _.pluck($scope.elb_sgs, 'GroupId');
            $scope.stack.security_groups = _.pluck($scope.sgs, 'GroupId');


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
        $scope.closeAlert = function (index) {
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

        // adds security group from the form
        $scope.addSecurityGroup = function (group) {
            $scope.sgs.push(group);
        };

        // removes a security group from the form
        $scope.removeSecurityGroup = function (index) {
            $scope.sgs.splice(index, 1);
        };

        // adds elb security group from the form
        $scope.addElbSecurityGroup = function (group) {
            $scope.elb_sgs.push(group);
        };

        // removes an elb security group from the form
        $scope.removeElbSecurityGroup = function (index) {
            $scope.elb_sgs.splice(index, 1);
        };


    });
