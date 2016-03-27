angular
    .module('stacks')
    .controller('stackController', function($scope, $stateParams, $http, $uibModal, $location, dataStore, _) {

        $scope.stack_name = $stateParams.stack_name;

        if (!$scope.stack_name) {
            return;
        }

        function mergeEc2Objects(group1, group2) {
            return _.each(group1, function(y) {
                var obj = _.find(group2, function(x) {
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

            return _.each(groups, function(group) {
                if (group.Instances.length < 1) {
                    return group;
                }
                var instances = _.pluck(group.Instances, 'InstanceId');
                $http.get('/api/v1/ec2/' + instances)
                    .success(function(data) {
                        group.Instances = mergeEc2Objects(group.Instances, data);
                        return group;
                    })
                    .error(function(err) {
                        dataStore.addAlert('danger', err);
                    });
            });
        }

        function getEc2(instances) {
            var instance_ids = _.pluck(instances, 'PhysicalResourceId');
            $http.get('/api/ec2/' + instance_ids)
                .success(function(data) {
                    $scope.instances = data;
                })
                .error(function(err) {

                });

        }


        function addTags(groups) {
            return _.each(groups, function(group) {
                group.version = _.find(group.Tags, function(tag) {
                        return tag.Key === 'version';
                    })
                    .Value;
                group.app_name = _.find(group.Tags, function(tag) {
                        return tag.Key === 'app_name';
                    })
                    .Value;
            });
        }

        function updateElb(groups) {

            return _.each(groups, function(group) {
                if (group.LoadBalancerNames.length < 1) {
                    return group;
                }
                $http.get('/api/v1/elb/' + group.LoadBalancerNames)
                    .success(function(data) {
                        group.LoadBalancerNames = data.LoadBalancerDescriptions;
                        return group;
                    })
                    .error(function(err) {});
            });
        }

        //setup functions
        function updateScaleGroups(scaleGroups) {
            var groups = _.pluck(scaleGroups, 'PhysicalResourceId');
            $http.get('/api/v1/asg/describe/' + groups)
                .success(function(data) {
                    console.log('asg', data);
                    var groups = data.AutoScalingGroups;
                    $scope.scaleGroups = updateEc2(groups);
                    $scope.scaleGroups = updateElb(groups);
                    $scope.scaleGroups = addTags(groups);
                });
        }



        $scope.adjustSize = function(app_name, version) {
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'partials/modals/adjust_size_form.html',
                controller: 'adjust_size_modal',
                size: 'md',
                resolve: {
                    stack_name: function() {
                        return $scope.stack_name;
                    },
                    app_name: function() {
                        return app_name;
                    },
                    version: function() {
                        return version;
                    }
                }
            });
        };

        $scope.isHappy = function(status) {
            if (status === 'Healthy') {
                return 'fa fa-smile-o';
            }
            return 'fa fa-frown-o';
        };

        $scope.inService = function(status) {
            switch (status) {
                case 'InService':
                    return 'fa  fa-thumbs-up';
                default:
                    return 'fa fa-circle-o-notch fa-spin';
            }
        };

        $scope.logColor = function(status) {
            if (status.includes('FAILED')) {
                return 'danger';
            }
        };

        $scope.rowColor = function(health, state) {
            if (health === 'Healthy' && state === 'InService') {
                return;
            } else if (health === 'Unhealthy') {
                return 'danger';
            } else {
                return 'warning';
            }
        };

        $scope.detachElb = function(scale_group, elb_name) {
            bootbox.confirm('Are you sure you want to detach this elb?', function(result) {
                if (result) {
                    $http.patch('/api/v1/elb/disconnect', {
                        scale_group: scale_group,
                        elb: elb_name
                    });
                }
            });
        };

        $scope.removeAsg = function(app_name, version) {

            var params = {
                app_name: app_name,
                version: version,
                stack_name: $scope.stack_name
            };

            $http.patch('/api/v1/delete_asg', params);
        };

        $scope.availableElbs = function(scale_group) {

            $http.get('/api/v1/available_elbs/' + $scope.stack_name)
                .success(function(response) {
                    $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'partials/modals/available_elbs.html',
                        controller: 'elb_modal',
                        size: 'md',
                        resolve: {
                            elbs: function() {
                                return response;
                            },
                            scale_group: function() {
                                return scale_group;
                            }
                        }
                    });
                });
        };

        $scope.status_label = function(status) {
            if (status !== 'READY') {
                return 'label label-warning';
            } else {
                return 'label label-success';
            }
        };

        $scope.status_fa_label = function(status) {
            if (status !== 'READY') {
                return 'fa fa-circle-o-notch fa-spin';
            } else {
                return 'fa fa-check-circle';
            }
        };

        $scope.stack_status_label = function(status) {
            if (status === 'UPDATE_COMPLETE' || status === 'CREATE_COMPLETE') {
                return 'label label-success';
            }
            return 'label label-warning';
        };

        $scope.stack_status_fa_label = function(status) {
            if (status && status.includes('COMPLETE')) {
                return 'fa fa-check-circle';
            }
            return 'fa fa-circle-o-notch fa-spin';
        };

        $http.get('/api/v1/stacks/status/' + $scope.stack_name)
            .success(function(response) {
                $scope.stack_status = response;
            });



        $http.get('/api/v1/stacks/' + $scope.stack_name)
            .success(function(data) {
                $scope.resources = data.StackResources;
                var instances = _.filter(data.StackResources, function(x) {
                    return x.ResourceType === 'AWS::EC2::Instance';
                });
                var scaleGroups = _.filter(data.StackResources, function(x) {
                    return x.ResourceType === 'AWS::AutoScaling::AutoScalingGroup';
                });
                $scope.scaleGroupSize = scaleGroups.length;
                if (scaleGroups.length > 0) {
                    updateScaleGroups(scaleGroups);
                } else if (instances.length > 0) {
                    getEc2(instances);
                }
            });

        $http.get('/api/v1/stacks/describeEvents/' + $scope.stack_name)
            .success(function(response) {
                $scope.stack_logs = response;
            });

        $http.get('/api/v1/chef/environments/' + $scope.stack_name)
            .success(function(response) {
                var defaults = response.default_attributes;
                if (defaults) {
                    $scope.chef_status = defaults.status;
                    $scope.rollback_available = defaults.rollback_available;
                    $scope.chef = defaults.concord_params;
                }
            });

    });
