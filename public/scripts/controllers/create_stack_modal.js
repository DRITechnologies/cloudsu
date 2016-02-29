stacks.controller('create_stack_modal', function ($scope, $http, $modalInstance, dataStore, $location) {

    $scope.alerts_modal = [];
    $scope.advanced = false;
    $scope.stack = {};
    $scope.stack.instance_store = false;
    $scope.stack.ebs_volume = false;
    $scope.stack.multi_az = false;
    $scope.stack.elb = {};
    $scope.stack.type = 'create';
    $scope.stack.ebs_root_size = 30;
    $scope.showSpinner = false;
    $scope.volume_count = 0;

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


        //convert strings to array
        if ($scope.stack.instance_groups_string) {
            $scope.stack.security_groups = $scope.stack.instance_groups_string.replace(/ /g, '').split(',');
        } else {
            $scope.stack.security_groups = [];
        }

        if ($scope.stack.elb_groups_string) {
            $scope.stack.elb_security_groups = $scope.stack.elb_groups_string.replace(/ /g, '').split(',');
        } else {
            $scope.stack.elb_security_groups = [];
        }

        if ($scope.stack.recipes_string) {
            $scope.stack.recipes = $scope.stack.recipes_string.replace(/ /g, '').split(',');
        } else {
            $scope.stack.recipes = [];
        }


        if (!$scope.stack.stack_name || $scope.stack.stack_name.match(/[^0-9a-z]/i)) {
            $scope.alerts_modal.push({
                type: 'danger',
                msg: 'AWS only allows Alphanumeric characters for stack names'
            });
            $scope.showSpinner = false;
            return;
        }

        var url = ['/api/v1/stacks/', $scope.stack.stack_name].join('');
        $http.post(url, $scope.stack)
            .success(function (res) {
                $scope.showSpinner = false;
                $modalInstance.dismiss('cancel');
                dataStore.addAlert('success', 'successfully created stack: ' + $scope.stack.stack_name);
                $location.path('/');
            })
            .error(function (err) {
                $scope.showSpinner = false;
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: err
                });
            });
    };

    $scope.getAccounts = function (config_management) {
        $http.get('/api/v1/services/get_accounts')
            .success(function (response) {
                $scope.accounts = response;
            });
    };


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };

});
