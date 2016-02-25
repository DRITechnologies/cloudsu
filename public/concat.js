'use strict';

var angular = require('angular');
require('jquery');

require('bootstrap');
require('angular-bootstrap-npm');

var _ = require('underscore');

var bootbox = require('bootbox');

require('angular-route');
require('ngstorage');

var ace = require('brace');
require('brace/mode/json');
require('brace/theme/solarized_dark');

require('angular-moment');


var stacks = angular.module('stacks', ['ngRoute', 'ngStorage', 'angularMoment', 'ui.bootstrap']);

stacks.controller('adjust_size_modal', function ($scope, $http, $modalInstance, stack_name,
    app_name, version, dataStore) {
    $scope.alerts_modal = [];

    var params = {
        stack_name: stack_name,
        app_name: app_name,
        version: version
    };

    $scope.adjustSize = function () {
        params = _.extend(params, $scope.adjust);
        $http.patch('/api/v1/adjust_size', params)
            .success(function (response) {
                $modalInstance.dismiss('cancel');
                dataStore.addAlert('success', 'successfully adjusted scale group size');
            })
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };



});
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
            .error(function (res) {
                $scope.showSpinner = false;
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
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
stacks.controller('elb_modal', function ($scope, $http, $modalInstance, elbs, scale_group, dataStore) {
    $scope.alerts_modal = [];
    $scope.elbs = elbs;


    $scope.connect = function () {
        $http.patch('/api/v1/elb/connect', {
                scale_group: scale_group,
                elb: $scope.elb_name
            }).success(function (data) {
                $modalInstance.dismiss();
                dataStore.addAlert('success', 'connected elb: ' + $scope.elb_name + ' to scale group: ' + scale_group);
            })
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };

});
// model editor view
stacks.controller('env_editor_modal', function ($scope, $http, $modalInstance, environment,
    dataStore) {
    $scope.alerts_modal = [];

    var environmentBody;
    $scope.name = environment.name;

    $scope.ready = function () {
        var editor = ace.edit('editor');
        editor.getSession().setMode('ace/mode/json');
        editor.setTheme('ace/theme/solarized_dark');
        var _session = editor.getSession();
        var o = environment;
        var val = JSON.stringify(o, null, 4);
        editor.$blockScrolling = Infinity;
        editor.getSession().setTabSize(4);
        editor.setValue(val, 1);
        editor.setOption('showPrintMargin', false);
        _session.on('change', function () {
            environmentBody = _session.getValue();
        });
    };



    $scope.onDeploy = function () {
        $http.put('/api/v1/chef/environments/update', environmentBody)
            .success(function (data) {
                $modalInstance.dismiss();
                dataStore.addAlert('success', 'successfully updated environment');
            })
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };
});
stacks.controller('footer_bar', function ($scope, $http, dataStore) {

});
stacks.controller('login_controller', function ($scope, $http, $location, $modal, dataStore) {

    $scope.showSpinner = false;
    dataStore.clearAll();
    $scope.alerts = [];


    $scope.attemptLogin = function () {
        var user = {
            email: $scope.user.email,
            password: $scope.user.password
        };

        $scope.showSpinner = true;

        $http.post('/api/v1/users/login', user)
            .success(function (user) {

                console.log('token in login', user.token);

                //load settings for user
                dataStore.setToken(user.token);
                dataStore.setIsLogin(true);
                dataStore.setActiveUser(user.name);
                dataStore.setActiveAWS(user.aws_account);
                dataStore.setActiveRegion(user.aws_region);
                dataStore.setCmsName(user.cms_name);
                $location.path('/');
            })
            .error(function (err) {

                //stop spinnner and present error
                $scope.showSpinner = false;
                $scope.alerts.push({
                    type: 'danger',
                    msg: err
                });
            });

    };

    $scope.close_alert = function (index) {
        $scope.alerts.splice(index, 1);
    };



});

stacks.controller('main_controller', function ($scope, $http, $location, $modal, dataStore) {

    $scope.alerts = dataStore.getAlerts();

    $http.get('/api/v1/ping/' + dataStore.getToken())
        .success(function (res) {
            if (!res.setup) {
                dataStore.setIsLogin(false);
                $location.path('/setup');
                return;
            } else if (!res.login) {
                dataStore.clearAll();
                dataStore.setIsLogin(false);
                $location.path('/login');
                return;
            }
            dataStore.setIsLogin(true);
        });

    $scope.showSpinner = function () {
        return dataStore.getShowSpinner();
    };

    //manipulates view
    $scope.isLogin = function () {
        return dataStore.getIsLogin();
    };

    $scope.close_alert = function (index) {
        $scope.alerts.splice(index, 1);
        dataStore.setAlerts($scope.alerts);
    };

});

stacks.controller('nav_bar', function ($scope, $http, $location, $modal, dataStore) {
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
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
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
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
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
                    .error(function (res) {
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

stacks.controller('rollback_modal', function ($scope, $http, $modalInstance, stack_name, dataStore) {
    $scope.alerts_modal = [];
    $scope.stack_name = stack_name;


    $http.get('/api/v1/chef/rollback_check/' + $scope.stack_name)
        .success(function (response) {
            $scope.rollback_available = response;
        })
        .error(function (res) {
            $scope.alerts_modal.push({
                type: 'danger',
                msg: res.message
            });
        });

    $scope.rollback = function () {
        $scope.showSpinner = true;
        $http.patch('/api/v1/upgrade/rollback', {
                stack_name: $scope.stack_name
            })
            .success(function (response) {
                $scope.showSpinner = false;
                dataStore.addAlert('success', 'successfully rolled stack back');
                $modalInstance.dismiss('cancel');
            })
            .error(function (res) {
                $scope.showSpinner = false;
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };


});
stacks.controller('service_account_modal', function ($scope, $http, $location, $modal, $modalInstance, dataStore, type, server, account) {
    $scope.alerts_modal = [];

    $scope.account = account;

    $scope.saveServiceAccount = function () {


        $scope.account.type = type;

        if (type === 'CMS') {
            $scope.account.name = 'CHEF';
        }

        $http.post('/api/v1/services/save_account', $scope.account)
            .success(function (res) {
                if (!dataStore.getActiveAWS() && type === 'AWS') {
                    dataStore.setActiveAWS($scope.account.name);
                }

                $modalInstance.dismiss('cancel');
            })
            .error(function (err) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: err
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };

});

stacks.controller('setup', function ($scope, $http, $location, $modal, dataStore) {
    $scope.showSpinner = false;
    $scope.alerts = [];

    $http.get('/api/v1/regions')
        .success(function (regions) {
            $scope.regions = regions;
        });

    $scope.create = function () {
        $scope.account.aws.type = 'AWS';
        $scope.account.aws.name = 'DEFAULT';
        $scope.account.cms.name = 'DEFAULT';
        $scope.account.user.type = 'USER';
        if ($scope.account.user.password !== $scope.account.user.confirm) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Passwords do not match'
            });
            return;
        }
        $scope.showSpinner = true;
        $http.post('/api/v1/setup/' + $scope.account.aws.name, $scope.account)
            .success(function (response) {
                $scope.showSpinner = false;
                dataStore.setToken(response.token);
                dataStore.setActiveAWS($scope.account.aws.name);
                dataStore.setActiveRegion($scope.account.aws.region);
                $location.path('/login');
            })
            .error(function (err) {
                $scope.showSpinner = false;
                $scope.alerts.push({
                    type: 'danger',
                    msg: err.cause.message
                });
            });
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts.splice(index, 1);
    };

});

stacks.controller('stack_controller', function ($scope, $routeParams, $http, $modal, $location, $cacheFactory, dataStore) {

    dataStore.setShowBurger(true);
    dataStore.setShowPlus(false);
    dataStore.setShowSpinner(true);


    $scope.stack_name = $routeParams.stack_name;

    if (!$scope.stack_name) {
        return;
    }

    function mergeEc2Objects(group1, group2) {
        return _.each(group1, function (y) {
            var obj = _.find(group2, function (x) {
                return (x.InstanceId === y.InstanceId);
            });
            y.PrivateIpAddress = obj.PrivateIpAddress;
            y.PublicIpAddress = obj.PublicIpAddress;
            y.KeyName = obj.KeyName;
            y.InstanceType = obj.InstanceType;
            y.LaunchTime = obj.LaunchTime;
            y.ImageId = obj.ImageId;
            return y;
        });
    }

    function updateEc2(groups) {

        return _.each(groups, function (group) {
            if (group.Instances.length < 1) {
                return group;
            }
            var instances = _.pluck(group.Instances, 'InstanceId');
            $http.get('/api/v1/ec2/' + instances)
                .success(function (data) {
                    group.Instances = mergeEc2Objects(group.Instances, data);
                    return group;
                })
                .error(function (res) {
                    dataStore.addAlert('danger', res.message);
                });
        });
    }

    function getEc2(instances) {
        var instance_ids = _.pluck(instances, 'PhysicalResourceId');
        $http.get('/api/ec2/' + instance_ids)
            .success(function (data) {
                $scope.instances = data;
                dataStore.setShowSpinner(false);
            })
            .error(function (err) {
                dataStore.addAlert('danger', err.message);
                dataStore.setShowSpinner(false);
            });

    }


    function addTags(groups) {
        return _.each(groups, function (group) {
            group.version = _.find(group.Tags, function (tag) {
                return tag.Key === 'version';
            }).Value;
            group.app_name = _.find(group.Tags, function (tag) {
                return tag.Key === 'app_name';
            }).Value;
        });
    }

    function updateElb(groups) {

        return _.each(groups, function (group) {
            if (group.LoadBalancerNames.length < 1) {
                return group;
            }
            $http.get('/api/v1/elb/' + group.LoadBalancerNames)
                .success(function (data) {
                    group.LoadBalancerNames = data.LoadBalancerDescriptions;
                    return group;
                })
                .error(function (res) {
                    dataStore.addAlert('danger', res.message);
                });
        });
    }

    //setup functions
    function updateScaleGroups(scaleGroups) {
        var groups = _.pluck(scaleGroups, 'PhysicalResourceId');
        $http.get('/api/v1/asg/describe/' + groups)
            .success(function (data) {
                console.log('asg', data);
                var groups = data.AutoScalingGroups;
                $scope.scaleGroups = updateEc2(groups);
                $scope.scaleGroups = updateElb(groups);
                $scope.scaleGroups = addTags(groups);
                dataStore.setShowSpinner(false);
            })
            .error(function (res) {
                dataStore.addAlert('danger', res.message);
            });
    }



    $scope.adjustSize = function (app_name, version) {
        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/adjust_size_form.html',
            controller: 'adjust_size_modal',
            size: 'md',
            resolve: {
                stack_name: function () {
                    return $scope.stack_name;
                },
                app_name: function () {
                    return app_name;
                },
                version: function () {
                    return version;
                }
            }
        });
    };

    $scope.isHappy = function (status) {
        if (status === 'Healthy') {
            return 'fa fa-smile-o';
        }
        return 'fa fa-frown-o';
    };

    $scope.inService = function (status) {
        switch (status) {
            case 'InService':
                return 'fa  fa-thumbs-up';
            default:
                return 'fa fa-circle-o-notch fa-spin';
        }
    };

    $scope.logColor = function (status) {
        if (status.includes('FAILED')) {
            return 'danger';
        }
    };

    $scope.rowColor = function (health, state) {
        if (health === 'Healthy' && state === 'InService') {
            return;
        } else if (health === 'Unhealthy') {
            return 'danger';
        } else {
            return 'warning';
        }
    };

    $scope.detachElb = function (scale_group, elb_name) {
        bootbox.confirm('Are you sure you want to detach this elb?', function (result) {
            if (result) {
                $http.patch('/api/v1/elb/disconnect', {
                        scale_group: scale_group,
                        elb: elb_name
                    }).success(function (res) {
                        dataStore.addAlert('success', res);
                    })
                    .error(function (res) {
                        dataStore.addAlert('danger', res.message);
                    });
            }
        });
    };

    $scope.removeAsg = function (app_name, version) {

        var params = {
            app_name: app_name,
            version: version,
            stack_name: $scope.stack_name
        };

        $http.patch('/api/v1/delete_asg', params)
            .success(function (response) {
                dataStore.addAlert('success', response);
            })
            .error(function (res) {
                dataStore.addAlert('danger', res.message);
            });
    };

    $scope.availableElbs = function (scale_group) {

        $http.get('/api/v1/available_elbs/' + $scope.stack_name)
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/modals/available_elbs.html',
                    controller: 'elb_modal',
                    size: 'md',
                    resolve: {
                        elbs: function () {
                            return response;
                        },
                        scale_group: function () {
                            return scale_group;
                        }
                    }
                });
            }).error(function (res) {
                dataStore.addAlert('danger', res.message);
            });
    };

    $scope.status_label = function (status) {
        if (status !== 'READY') {
            return 'label label-warning';
        } else {
            return 'label label-success';
        }
    };

    $scope.status_fa_label = function (status) {
        if (status !== 'READY') {
            return 'fa fa-circle-o-notch fa-spin';
        } else {
            return 'fa fa-check-circle';
        }
    };

    $scope.stack_status_label = function (status) {
        if (status === 'UPDATE_COMPLETE' || status === 'CREATE_COMPLETE') {
            return 'label label-success';
        }
        return 'label label-warning';
    };

    $scope.stack_status_fa_label = function (status) {
        if (status && status.includes('COMPLETE')) {
            return 'fa fa-check-circle';
        }
        return 'fa fa-circle-o-notch fa-spin';
    };

    $http.get('/api/v1/stacks/status/' + $scope.stack_name)
        .success(function (response) {
            $scope.stack_status = response;
        })
        .error(function (err) {
            dataStore.addAlert('danger', err.message);
        });



    $http.get('/api/v1/stacks/' + $scope.stack_name)
        .success(function (data) {
            $scope.resources = data.StackResources;
            console.log(data);
            var instances = _.filter(data.StackResources, function (x) {
                return x.ResourceType === 'AWS::EC2::Instance';
            });
            var scaleGroups = _.filter(data.StackResources, function (x) {
                return x.ResourceType === 'AWS::AutoScaling::AutoScalingGroup';
            });
            $scope.scaleGroupSize = scaleGroups.length;
            if (scaleGroups.length > 0) {
                updateScaleGroups(scaleGroups);
            } else if (instances.length > 0) {
                getEc2(instances);
            } else {
                dataStore.setShowSpinner(false);
            }
        });

    $http.get('/api/v1/stacks/describeEvents/' + $scope.stack_name)
        .success(function (response) {
            $scope.stack_logs = response;
        })
        .error(function (res) {
            dataStore.addAlert('danger', res.message);
        });

    $http.get('/api/v1/chef/environments/' + $scope.stack_name)
        .success(function (response) {
            var defaults = response.default_attributes;
            if (defaults) {
                $scope.chef_status = defaults.status;
                $scope.rollback_available = defaults.rollback_available;
                $scope.chef = defaults.concord_params;
                dataStore.setBuildSize(defaults.concord_params.build_size);
            }
        })
        .error(function (res) {
            dataStore.addAlert('danger', res.message);
        });

});

// model editor view
stacks.controller('stack_editor_modal', function ($scope, $http, $modalInstance, template, stack_name,
    dataStore) {
    $scope.alerts_modal = [];
    $scope.name = stack_name;
    var templateBody;

    $scope.ready = function () {
        var editor = ace.edit('editor');
        editor.getSession().setMode('ace/mode/json');
        editor.setTheme('ace/theme/solarized_dark');
        var _session = editor.getSession();
        var o = JSON.parse(template);
        var val = JSON.stringify(o, null, 4);
        editor.$blockScrolling = Infinity;
        editor.getSession().setTabSize(4);
        editor.setValue(val, 1);
        editor.setOption('showPrintMargin', false);
        _session.on('change', function () {
            templateBody = _session.getValue();
        });
    };

    $scope.onDeploy = function () {
        $http.put('/api/v1/stacks/' + stack_name, {
                'template': templateBody,
                'stack_name': stack_name
            }).success(function (data) {
                $modalInstance.dismiss();
                dataStore.addAlert('success', 'successfully updated stack');
            })
            .error(function (res) {
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function (index) {
        $scope.alerts_modal.splice(index, 1);
    };
});
// view controllers
stacks.controller('stacks_controller', function ($scope, $http, $location, $modal, dataStore) {
    dataStore.setShowBurger(false);
    dataStore.setShowPlus(true);
    dataStore.setShowSpinner(true);


    //set short delay to ensure local storage is up to date

    $http.get('/api/v1/stacks')
        .success(function (res) {
            $scope.stacks = res.StackSummaries;
            dataStore.setShowSpinner(false);
        })
        .error(function (err) {
            dataStore.setShowSpinner(false);
        });

    $scope.openStack = function (stack_name) {
        dataStore.clearAlerts();
        $scope.alerts = [];
        dataStore.setStack(stack_name);
        $location.path('/stack/' + stack_name);
    };

    $scope.deleteStack = function ($event, stack_name) {
        $event.stopImmediatePropagation();
        bootbox.confirm('Are you sure you want to delete ' + stack_name + '?', function (
            result) {
            if (result) {
                $http.delete('/api/v1/stacks/' + stack_name)
                    .success(function (res) {
                        dataStore.addAlert('success', 'successfully deleted stack: ' + stack_name);
                    })
                    .error(function (res) {
                        dataStore.addAlert('danger', res.message);
                    });
            }
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

    $scope.stack_status = function (status) {
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


});
stacks.controller('system', function ($scope, $http, $location, $modal, dataStore) {

    dataStore.setShowBurger(false);
    dataStore.setShowPlus(false);


    $http.get('/api/v1/services/get_accounts/CMS')
        .success(function (response) {
            $scope.chef_accounts = response;
        });

    $http.get('/api/v1/services/get_accounts/AWS')
        .success(function (response) {
            $scope.aws_accounts = response;
        });

    //open chef modal
    $scope.chefModal = function () {
        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/chef.html',
            controller: 'service_account_modal',
            size: 'lg',
            resolve: {
                type: function () {
                    return 'CMS';
                },
                server: function () {
                    return 'CHEF';
                },
                account: function () {
                    return false;
                }
            }
        });
    };

    $scope.getChefModal = function (name) {

        $http.get('/api/v1/services/get_account/CMS/' + name)
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/modals/chef.html',
                    controller: 'service_account_modal',
                    size: 'lg',
                    resolve: {
                        type: function () {
                            return 'CMS';
                        },
                        server: function () {
                            return 'CHEF';
                        },
                        account: function () {
                            return response;
                        }
                    }
                });

            });
    };

    $scope.awsModal = function () {
        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/aws.html',
            controller: 'service_account_modal',
            size: 'lg',
            resolve: {
                type: function () {
                    return 'AWS';
                },
                server: function () {
                    return '';
                },
                account: function () {
                    return false;
                }
            }
        });
    };

    $scope.getAwsModal = function (name) {
        $http.get('/api/v1/services/get_account/CMS/' + name)
            .success(function (response) {
                $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'partials/modals/aws.html',
                    controller: 'service_account_modal',
                    size: 'lg',
                    resolve: {
                        type: function () {
                            return 'AWS';
                        },
                        server: function () {
                            return '';
                        },
                        account: function () {
                            return response;
                        }
                    }
                });
            });
    };


});

stacks.controller('upgrade_modal', function($scope, $http, $modalInstance, stack_name, dataStore) {

    $scope.alerts_modal = [];
    $scope.advanced = false;
    $scope.stack = {};
    $scope.stack.apps = [];
    $scope.stack.type = 'upgrade';
    $scope.stack.stack_name = stack_name;
    $scope.build_size = dataStore.getBuildSize();
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
                $modalInstance.dismiss();
                dataStore.addAlert('success', 'successfully started upgrade');
            })
            .error(function(res) {
                $scope.showSpinner = false;
                $scope.alerts_modal.push({
                    type: 'danger',
                    msg: res.message
                });
            });
    };


    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.close_alert_modal = function(index) {
        $scope.alerts_modal.splice(index, 1);
    };
});
// directives
stacks.directive('navbar', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/bars/navbar.html'
    };
});

stacks.directive('documentation', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/bars/footer_bar.html'
    };
});

stacks.directive('alerts', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/alerts.html'
    };
});


stacks.directive('alertsmodal', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/alerts_modal.html'
    };
});

stacks.directive('spinner', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/extras/spinner.html'
    };
});
//factories
stacks.factory('dataStore', function ($localStorage, $window) {

    return {
        setStack: function (stack_name) {
            $localStorage.stack_name = stack_name;
        },
        getStack: function () {
            return $localStorage.stack_name;
        },
        clearStack: function () {
            $localStorage.stack_name = '';
        },
        setActiveUser: function (email) {
            $localStorage.email = email;
        },
        getActiveUser: function () {
            return $localStorage.email;
        },
        setActiveAWS: function (account) {
            $localStorage.aws_account = account;
        },
        getActiveAWS: function () {
            return $localStorage.aws_account;
        },
        setActiveRegion: function (region) {
            $localStorage.aws_region = region;
        },
        getActiveRegion: function () {
            return $localStorage.aws_region;
        },
        getCmsType: function () {
            return $localStorage.cms_type;
        },
        setCmsType: function (cms_type) {
            $localStorage.cms_type = cms_type;
        },
        getCmsName: function () {
            return $localStorage.cms_name;
        },
        setCmsName: function (cms_name) {
            $localStorage.cms_name = cms_name;
        },
        setToken: function (token) {
            $localStorage.token = token;
        },
        getToken: function () {
            return $localStorage.token;
        },
        setBuildSize: function (build_type) {
            $localStorage.build_type = build_type;
        },
        getBuildSize: function () {
            return $localStorage.build_type;
        },
        setShowBurger: function (bool) {
            $localStorage.showBurger = bool;
        },
        getShowBurger: function () {
            return $localStorage.showBurger;
        },
        setShowPlus: function (bool) {
            $localStorage.showPlus = bool;
        },
        getShowPlus: function () {
            return $localStorage.showPlus;
        },
        getShowSpinner: function () {
            return $localStorage.showSpinner;
        },
        setShowSpinner: function (bool) {
            $localStorage.showSpinner = bool;
        },
        getAlerts: function () {
            return $localStorage.alerts;
        },
        setRegion: function (region) {
            $localStorage.region = region;
        },
        getRegion: function () {
            return $localStorage.region;
        },
        addAlert: function (type, msg) {
            msg = new Date() + ' ' + msg;
            $localStorage.alerts.push({
                type: type,
                msg: msg
            });
        },
        setAlerts: function (alerts) {
            $localStorage.alerts = alerts;
        },
        setIsLogin: function (bool) {
            $localStorage.isLogin = bool;
        },
        getIsLogin: function () {
            return $localStorage.isLogin;
        },
        clearAlerts: function () {
            $localStorage.alerts = [];
        },
        initAlerts: function () {
            if (!$localStorage.alerts) {
                $localStorage.alerts = [];
            }
        },
        clearAll: function () {
            $localStorage.$reset();
        }
    };

});

stacks.factory('httpRequestInterceptor', function (dataStore) {

    return {
        request: function (config) {

            config.headers.aws_account = dataStore.getActiveAWS() || '';
            config.headers.aws_region = dataStore.getActiveRegion() || '';
            config.headers.cms_name = dataStore.getCmsName() || '';
            config.headers.token = dataStore.getToken() || '';

            return config;
        }
    };
});

stacks.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
});

// configure our routes
stacks.config(function ($routeProvider) {
    $routeProvider
    // route for the home page
        .when('/', {
            templateUrl: 'partials/pages/stacks.html',
            controller: 'stacks_controller'
        })
        .when('/setup', {
            templateUrl: 'partials/pages/setup.html',
            controller: 'setup'
        })
        // route for detail of stack
        .when('/stack/:stack_name', {
            templateUrl: 'partials/pages/stack.html',
            controller: 'stack_controller'
        })
        .when('/system', {
            templateUrl: 'partials/pages/system.html',
            controller: 'system'
        })
        .when('/login', {
            templateUrl: 'partials/pages/login.html',
            controller: 'login_controller'
        });
});