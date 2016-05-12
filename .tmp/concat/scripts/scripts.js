// sizing script

$(document)
    .ready(function() {


        // Full height of sidebar
        function fix_height() {
            var heightWithoutNavbar = $('body > #wrapper')
                .height() - 61;
            $('.sidebard-panel')
                .css('min-height', heightWithoutNavbar + 'px');

            var navbarHeigh = $('nav.navbar-default')
                .height();
            var wrapperHeigh = $('#page-wrapper')
                .height();

            if (navbarHeigh > wrapperHeigh) {
                $('#page-wrapper')
                    .css('min-height', navbarHeigh + 'px');
            }

            if (navbarHeigh < wrapperHeigh) {
                $('#page-wrapper')
                    .css('min-height', $(window)
                        .height() + 'px');
            }

            if ($('body')
                .hasClass('fixed-nav')) {
                if (navbarHeigh > wrapperHeigh) {
                    $('#page-wrapper')
                        .css('min-height', navbarHeigh - 60 + 'px');
                } else {
                    $('#page-wrapper')
                        .css('min-height', $(window)
                            .height() - 60 + 'px');
                }
            }

        }

        $(window)
            .bind('load resize scroll', function() {
                if (!$('body')
                    .hasClass('body-small')) {
                    fix_height();
                }
            });

        // Move right sidebar top after scroll
        $(window)
            .scroll(function() {
                if ($(window)
                    .scrollTop() > 0 && !$('body')
                    .hasClass('fixed-nav')) {
                    $('#right-sidebar')
                        .addClass('sidebar-top');
                } else {
                    $('#right-sidebar')
                        .removeClass('sidebar-top');
                }
            });

        setTimeout(function() {
            fix_height();
        });

    });

// Minimalize menu when screen is less than 768px
$(function() {
    $(window)
        .bind('load resize', function() {
            if ($(document)
                .width() < 769) {
                $('body')
                    .addClass('body-small');
            } else {
                $('body')
                    .removeClass('body-small');
            }
        });
});

(function() {
    angular.module('stacks', [
        'ui.router', // Routing
        'ui.bootstrap', // Bootstrap
        'ngStorage', //NG Storage
        'angularMoment', //MomentJS
        'underscore', //Underscore
        'oitozero.ngSweetAlert', //Sweet Alert
        'ace', // Ace Editor
        'toastr', // Toastr library
        'ngAnimate', // Animate for toastr
        'angular-ladda', // Ladda buttons library
        'ngPrettyJson' // Pretty json library
    ]);
})();

function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/index/stacks');

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('index', {
            abstract: true,
            url: '/index',
            templateUrl: 'views/common/content.html',
        })
        .state('index.detail', {
            url: '/stacks/:stack_name',
            templateUrl: 'views/stack.html',
            controller: 'stackController'
        })
        .state('index.stacks', {
            url: '/stacks',
            templateUrl: 'views/stacks.html',
            controller: 'stacksController'
        })
        .state('index.users', {
            url: '/users',
            templateUrl: 'views/users.html',
            controller: 'usersController'
        })
        .state('index.system', {
            url: '/system',
            templateUrl: 'views/system.html',
            controller: 'system'
        });
}
angular
    .module('stacks')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });

/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'su';
                // Create your own title pattern

                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    };
}

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            $timeout(function() {
                element.metisMenu();
            });
        }
    };
}

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools.html',
        controller: function($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function() {
                    var ibox = $element.closest('div.ibox');
                    var icon = $element.find('i:first');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    // Toggle icon from up to down
                    icon.toggleClass('fa-chevron-up')
                        .toggleClass('fa-chevron-down');
                    ibox.toggleClass('')
                        .toggleClass('border-bottom');
                    $timeout(function() {
                        ibox.resize();
                        ibox.find('[id^=map-]')
                            .resize();
                    }, 50);
                },
                // Function for close ibox
                $scope.closebox = function() {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                };
        }
    };
}

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: function($scope, $element) {
            $scope.minimalize = function() {
                $('body')
                    .toggleClass('mini-navbar');
                if (!$('body')
                    .hasClass('mini-navbar') || $('body')
                    .hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu')
                        .hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function() {
                            $('#side-menu')
                                .fadeIn(400);
                        }, 200);
                } else if ($('body')
                    .hasClass('fixed-sidebar')) {
                    $('#side-menu')
                        .hide();
                    setTimeout(
                        function() {
                            $('#side-menu')
                                .fadeIn(400);
                        }, 100);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu')
                        .removeAttr('style');
                }
            };
        }
    };
}

/**
 * iboxTools with full screen - Directive for iBox tools elements in right corner of ibox with full screen option
 */
function iboxToolsFullScreen($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools_full_screen.html',
        controller: function($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function() {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up')
                    .toggleClass('fa-chevron-down');
                ibox.toggleClass('')
                    .toggleClass('border-bottom');
                $timeout(function() {
                    ibox.resize();
                    ibox.find('[id^=map-]')
                        .resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function() {
                var ibox = $element.closest('div.ibox');
                ibox.remove();
            };
            // Function for full screen
            $scope.fullscreen = function() {
                var ibox = $element.closest('div.ibox');
                var button = $element.find('i.fa-expand');
                $('body')
                    .toggleClass('fullscreen-ibox-mode');
                button.toggleClass('fa-expand')
                    .toggleClass('fa-compress');
                ibox.toggleClass('fullscreen');
                setTimeout(function() {
                    $(window)
                        .trigger('resize');
                }, 100);
            };
        }
    };
}

/**
 * Alerts directive
 */

function alerts() {
    return {
        restrict: 'E',
        templateUrl: 'views/extras/alerts.html'
    };
}

/**
 * spinner directive
 */
function spinner() {
    return {
        restrict: 'E',
        templateUrl: 'views/extras/spinner.html'
    };
}


/**
 *
 * Pass all functions into module
 */
angular
    .module('stacks')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('minimalizaSidebar', minimalizaSidebar)
    .directive('iboxToolsFullScreen', iboxToolsFullScreen)
    .directive('spinner', spinner)
    .directive('alerts', alerts);

/**
 * MainCtrl - controller
 */
angular
    .module('stacks')
    .controller('MainCtrl', function($scope, $http, $state, $uibModal, dataStore, SweetAlert) {

        $scope.userName = dataStore.getActiveUser();
        $scope.activeAws = dataStore.getActiveAWS();
        $scope.activeRegion = dataStore.getActiveRegion();
        $scope.isLogin = dataStore.getIsLogin();

        //send refesh to child controller
        function childRefresh() {
            $scope.$broadcast('refresh');
        }

        //get available regions
        function refresh() {
            $http.get('/api/v1/regions')
                .success(function(regions) {
                    $scope.aws_regions = regions;
                });

            //get available aws accounts
            $http.get('/api/v1/services/list')
                .success(function(accounts) {
                    $scope.aws_accounts = accounts;
                });
        }

        //logout method
        $scope.logout = function() {
            dataStore.clearAll();
            $state.go('login');
        };

        //Get bear api token
        $scope.getToken = function() {
            $http.get('/api/v1/accounts/token')
                .success(function(token) {
                    SweetAlert.swal({
                        title: 'Service API Token',
                        text: '<pre><code>' + token + '</code></pre>',
                        html: true,
                        type: 'success',
                        confirmButtonColor: '#1ab394'
                    });
                })
                .error(function(err) {

                });

        };

        $scope.resetPassword = function() {
            //open reset password modal
            $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/resetPassword.html',
                controller: 'resetPassword',
                size: 'md'
            });
        };

        $scope.activateRegion = function(region) {
            //save active account in local storage
            dataStore.setActiveRegion(region);
            $scope.activeRegion = region;
            //refresh child screen to reflect changes
            childRefresh();
            //update db so changes will be reflected in next login
            $http.put('/api/v1/accounts', {
                aws_region: region
            });

        };

        $scope.activateAccount = function(account) {
            //save active account in local storage
            dataStore.setActiveAWS(account);
            $scope.activeAws = account;
            //refresh child screen to reflect changes
            childRefresh();
            //update db so changes will be reflected in next login
            $http.put('/api/v1/accounts', {
                aws_account: account
            });
        };

        $scope.startup = function() {
            $scope.isLogin = true;
            refresh();
        };

        if ($scope.isLogin) {
            refresh();
        }

    });

angular
    .module('stacks')
    .config(function(toastrConfig) {
        angular.extend(toastrConfig, {
            closeButton: true,
            extendedTimeOut: 1000,
            progressBar: true,
            tapToDismiss: true,
            timeOut: 5000,
            toastClass: 'toast'
        });

        angular.extend(toastrConfig, {
            containerId: 'toast-container',
            maxOpened: 5,
            newestOnTop: false,
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            preventOpenDuplicates: false,
        });
    });

angular.module('stacks')
    .config(function(laddaProvider) {
        laddaProvider.setOption({
            style: 'expand-left',
            spinnerSize: 20,
            spinnerColor: '#ffffff'
        });
    });

//factories
angular
    .module('stacks')
    .factory('dataStore', function($localStorage, $window) {

        return {
            setStack: function(stack_name) {
                $localStorage.stack_name = stack_name;
            },
            getStack: function() {
                return $localStorage.stack_name;
            },
            setIsLogin: function(bool) {
                $localStorage.isLogin = bool;
            },
            getIsLogin: function() {
                return $localStorage.isLogin;
            },
            clearStack: function() {
                $localStorage.stack_name = '';
            },
            setActiveUser: function(email) {
                $localStorage.email = email;
            },
            getActiveUser: function() {
                return $localStorage.email;
            },
            setActiveAWS: function(account) {
                $localStorage.aws_account = account;
            },
            getActiveAWS: function() {
                return $localStorage.aws_account || 'DEFAULT';
            },
            setActiveRegion: function(region) {
                $localStorage.aws_region = region;
            },
            getActiveRegion: function() {
                return $localStorage.aws_region || 'us-east-1';
            },
            getCmsType: function() {
                return $localStorage.cms_type;
            },
            setCmsType: function(cms_type) {
                $localStorage.cms_type = cms_type;
            },
            getCmsName: function() {
                return $localStorage.cms_name;
            },
            setCmsName: function(cms_name) {
                $localStorage.cms_name = cms_name;
            },
            setToken: function(token) {
                $localStorage.token = token;
            },
            getToken: function() {
                return $localStorage.token;
            },
            setBuildSize: function(build_type) {
                $localStorage.build_type = build_type;
            },
            getBuildSize: function() {
                return $localStorage.build_type;
            },
            setRegion: function(region) {
                $localStorage.region = region;
            },
            getRegion: function() {
                return $localStorage.region;
            },
            clearAll: function() {
                $localStorage.$reset();
            }
        };

    });

angular
    .module('stacks')
    .factory('httpRequestInterceptor', function(dataStore) {
        return {
            request: function(config) {
                config.headers.aws_account = dataStore.getActiveAWS() || 'DEFAULT';
                config.headers.aws_region = dataStore.getActiveRegion() || 'us-east-1';
                config.headers.token = dataStore.getToken() || '';
                return config;
            }
        };
    });

angular
    .module('stacks')
    .factory('httpResponseInterceptor', function($location, $q) {
        return {
            responseError: function(err) {

                if (err.status === 401) {
                    $location.path('/login');
                    return $q.reject(err);
                }
                return $q.reject(err);
            }
        };
    });

angular
    .module('stacks')
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('httpResponseInterceptor');
        $httpProvider.interceptors.push('httpRequestInterceptor');
    });

angular
    .module('stacks')
    .controller('stacksController', function($rootScope, $interval, $scope, $http, $state, $uibModal, SweetAlert, dataStore, toastr) {

        //Get stacks from AWS
        function refresh() {
            $http.get('/api/v1/stacks')
                .success(function(response) {
                    $scope.stacks = response;
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });
        }

        //catch alerts from parent to refresh
        $scope.$on('refresh', function() {
            refresh();
        });

        $scope.openCreateForm = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/createStack.html',
                controller: 'createStack',
                size: 'md'
            });

            modalInstance.result.then(function(selectedItem) {
                //refresh service accounts
                refresh();
            });
        };

        //Open stack detail view
        $scope.openStack = function(stack_name) {
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
                                refresh();
                            })
                            .error(function(err) {
                                toastr.error(err, 'AWS Error');
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

        // created outside function so it can be removed
        var intervalPromise;

        function refresher() {
            // refresh every 15 seconds
            intervalPromise = $interval(function() {
                refresh();
            }, 15000);
        }

        //stop refresher when the screen is changed
        $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });

        //get initial data
        refresh();
        //start refresher
        refresher();

    });

angular
    .module('stacks')
    .controller('stackController', function($scope, $q, $interval, $stateParams, $http, $uibModal, SweetAlert, dataStore, _, toastr) {

        $scope.stack_name = $stateParams.stack_name;

        if (!$scope.stack_name) {
            return;
        }

        //merge more data into the ec2 objects
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

        //get ec2 specific for autoscale groups
        function updateEc2() {
            _.each($scope.scaleGroups, function(group, index) {
                if (group.Instances.length < 1) {
                    return group;
                }
                var instances = _.pluck(group.Instances, 'InstanceId');
                $http.get('/api/v1/ec2/' + instances)
                    .success(function(data) {
                        $scope.scaleGroups[index].Instances = mergeEc2Objects(group.Instances, data);
                    })
                    .error(function(err) {
                        toastr.error(err, 'AWS Error');
                    });
            });
        }

        //get ec2 specific data for single
        function getEc2(instances) {
            var instance_ids = _.pluck(instances, 'PhysicalResourceId');
            $http.get('/api/v1/ec2/' + instance_ids)
                .success(function(data) {
                    $scope.instances = data;
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });

        }

        //get data from tags
        function addTags() {
            _.each($scope.scaleGroups, function(group, index) {
                $scope.scaleGroups[index].version = _.find(group.Tags, function(tag) {
                        return tag.Key === 'version';
                    })
                    .Value;
                $scope.scaleGroups[index].app_name = _.find(group.Tags, function(tag) {
                        return tag.Key === 'app_name';
                    })
                    .Value;
            });
        }

        //add more elb specific data
        function updateElb() {
            _.each($scope.scaleGroups, function(group, index) {
                if (group.LoadBalancerNames.length < 1) {
                    return group;
                }
                $http.get('/api/v1/elb/' + group.LoadBalancerNames)
                    .success(function(data) {
                        $scope.scaleGroups[index].LoadBalancerNames = data.LoadBalancerDescriptions;
                    })
                    .error(function(err) {
                        toastr.error(err, 'AWS Error');
                    });
            });
        }

        //setup functions
        function updateScaleGroups(scaleGroups) {
            var groups = _.pluck(scaleGroups, 'PhysicalResourceId');
            $http.get('/api/v1/asg/describe/' + groups)
                .success(function(response) {
                    $scope.scaleGroups = response.AutoScalingGroups;
                    updateEc2();
                    updateElb();
                    addTags();
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });
        }

        function refresh() {
            $http.get('/api/v1/stacks/status/' + $scope.stack_name)
                .success(function(response) {
                    $scope.stack_status = response;
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
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

                    if (scaleGroups.length > 0) {
                        updateScaleGroups(scaleGroups);
                    } else if (instances.length > 0) {
                        getEc2(instances);
                    }
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });

            $http.get('/api/v1/stacks/describeEvents/' + $scope.stack_name)
                .success(function(response) {
                    $scope.stack_logs = response;
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });

            $http.get('/api/v1/chef/environments/' + $scope.stack_name)
                .success(function(response) {
                    var defaults = response.default_attributes;
                    if (defaults) {
                        $scope.chef_status = defaults.status;
                        $scope.rollback_available = defaults.rollback_available;
                        $scope.chef = defaults.cloudsu_params;
                    }
                })
                .error(function(err) {
                    toastr.error(err, 'Chef Error');
                });

        }

        //adjust the size of autoscale group
        $scope.adjustSize = function(app_name, version) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/groupResize.html',
                controller: 'groupResize',
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

            modalInstance.result.then(function(selectedItem) {
                //refresh service accounts
                refresh();
            });
        };

        $scope.detachElb = function(scale_group, elb_name) {
            console.log(scale_group, elb_name);
            SweetAlert.swal({
                    title: '',
                    text: 'Are you sure you want to detach this ELB?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        $http.patch('/api/v1/elb/disconnect', {
                                scale_group: scale_group,
                                elb: elb_name
                            })
                            .success(function(response) {
                                refresh();
                                SweetAlert.swal('Success', elb_name + ' has been detached from scale group ' + scale_group, 'success');
                            })
                            .error(function(err) {
                                toastr.error(err, 'AWS Error');
                            });
                    }
                });
        };


        //remove one autoscale group
        $scope.removeAsg = function(app_name, version) {
            var params = {
                app_name: app_name,
                version: version,
                stack_name: $scope.stack_name
            };
            $http.patch('/api/v1/delete_asg', params)
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });
        };

        $scope.availableElbs = function(scale_group) {
            //get available ELBs
            $http.get('/api/v1/available_elbs/' + $scope.stack_name)
                .success(function(response) {
                    //open modal and give user a chance to connect ELB
                    var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'views/modals/connectElb.html',
                            controller: 'connectElb',
                            size: 'md',
                            resolve: {
                                elbs: function() {
                                    return response;
                                },
                                scale_group: function() {
                                    return scale_group;
                                }
                            }
                        })
                        .error(function(err) {
                            toastr.error(err, 'AWS Error');
                        });

                    modalInstance.result.then(function(selectedItem) {
                        //refresh service accounts
                        refresh();
                    });
                });
        };

        //open upgrade form
        $scope.openUpgradeForm = function() {
            $scope.stack_name = dataStore.getStack();
            $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/upgradeStack.html',
                controller: 'upgradeStack',
                size: 'md',
                resolve: {
                    stack_name: function() {
                        return $scope.stack_name;
                    },
                    build_size: function() {
                        return $scope.chef.build_size;
                    }
                }
            });
        };

        //open rollback modal
        $scope.rollback = function() {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/stackRollback.html',
                controller: 'stackRollback',
                size: 'md',
                resolve: {
                    stack_name: function() {
                        return $scope.stack_name;
                    }
                }
            });
        };

        //open check editor
        $scope.openEnvEditor = function() {

            $http.get('/api/v1/chef/environments/' + $scope.stack_name)
                .success(function(response) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/editor.html',
                        controller: 'chefEditor',
                        size: 'lg',
                        resolve: {
                            environment: function() {
                                return response;
                            },
                            stack_name: function() {
                                return $scope.stack_name;
                            }
                        }
                    });
                })
                .error(function(err) {
                    toastr.error(err, 'Chef Error');
                });
        };

        //open
        $scope.openStackEditor = function() {

            $http.get('/api/v1/stacks/template/' + $scope.stack_name)
                .success(function(response) {
                    $scope.template = response;
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/editor.html',
                        controller: 'templateEditor',
                        size: 'lg',
                        resolve: {
                            template: function() {
                                return $scope.template;
                            },
                            stack_name: function() {
                                return $scope.stack_name;
                            }
                        }
                    });
                })
                .error(function(err) {
                    toastr.error(err, 'AWS Error');
                });
        };

        $scope.saveJSON = function() {
            $scope.toJSON = '';
            $scope.toJSON = angular.toJson($scope.stack_logs);
            var blob = new Blob([$scope.toJSON], {
                type: 'application/json;charset=utf-8;'
            });
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', $scope.stack_name + '-CF-LOGS.json');
            downloadLink[0].click();
        };

        $scope.status_label = function(status) {
            if (status !== 'READY') {
                return 'badge badge-warning';
            } else {
                return 'badge badge-primary';
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
                return 'badge badge-primary';
            }
            return 'badge badge-warning';
        };

        $scope.stack_status_fa_label = function(status) {

            if (status && status.includes('PROGRESS')) {
                return 'fa fa-circle-o-notch fa-spin';
            }
            return 'fa fa-check-circle';

        };

        $scope.isHappy = function(status) {
            if (status === 'Healthy') {
                return 'fa fa-smile-o';
            }
            return 'fa fa-frown-o';
        };

        $scope.inService = function(status) {
            if (status === 'InService') {
                return 'fa  fa-thumbs-up';
            }
            return 'fa fa-circle-o-notch fa-spin';

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

        var intervalPromise;

        function refresher() {
            // refresh every 10 seconds
            intervalPromise = $interval(function() {
                refresh();
            }, 15000);
        }

        //stop refresher when the screen is changed
        $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });

        //get initial data
        refresh();
        //start refresher
        refresher();

    });

angular
    .module('stacks')
    .controller('loginController', function($rootScope, $scope, $http, $state, $uibModal, dataStore, toastr) {

        //set default spinner action
        $scope.showSpinner = false;
        //remove all data in local storage
        dataStore.clearAll();


        $scope.attemptLogin = function() {

            // setup http body
            var user = {
                name: $scope.user.name,
                password: $scope.user.password
            };

            //display spinner while authenticating
            $scope.showSpinner = true;

            $http.post('/api/v1/accounts/login', user)
                .success(function(user) {
                    //stop spinnner
                    $scope.showSpinner = false;

                    //save user settings in localstorage
                    dataStore.setToken(user.token);
                    dataStore.setActiveUser(user.name);
                    dataStore.setActiveAWS(user.aws_account);
                    dataStore.setActiveRegion(user.aws_region);
                    dataStore.setIsLogin(true);

                    // run refresh on parent controller
                    $scope.startup();

                    //set parent values because they will not reload
                    if (user.aws_account) {
                        $scope.$parent.activeAws = user.aws_account;
                    }
                    if (user.aws_region) {
                        $scope.$parent.activeRegion = user.aws_region;
                    }
                    if (user.name) {
                        $scope.$parent.userName = user.name;
                    }

                    $state.go('index.stacks');
                })
                .error(function(err) {
                    //stop spinnner and present error
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });

        };

        $scope.setup = function() {
            //only show setup modal if it has not run before
            $http.get('/api/v1/ping/' + dataStore.getToken())
                .success(function(res) {

                    if (!res.setup) {
                        $uibModal.open({
                            animation: true,
                            backdrop: true,
                            templateUrl: 'views/setup.html',
                            controller: 'setup',
                            size: 'md',
                            resolve: {
                                items: function() {
                                    return $scope.items;
                                }
                            }
                        });
                    } else {
                        //add alert to show that the system has already been setup
                        toastr.error('System has already been setup', 'Error');
                    }
                });
        };

        $scope.import = function() {
            //only show setup modal if it has not run before
            $http.get('/api/v1/ping/' + dataStore.getToken())
                .success(function(res) {

                    if (!res.setup) {
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'views/modals/import.html',
                            controller: 'import',
                            size: 'md'
                        });
                    } else {
                        //add alert to show that the system has already been setup
                        toastr.error('System has already been setup', 'Error');
                    }
                });
        };


    });

angular
    .module('stacks')
    .controller('setup', function($scope, $http, $state, $interval, $uibModalInstance, dataStore, toastr, SweetAlert) {

        $scope.showSpinner = false;
        $scope.activeTab = 'aws-tab';
        $scope.bar_value = 0;

        $http.get('/api/v1/regions')
            .success(function(regions) {
                $scope.regions = regions;
            })
            .error(function(err) {
                toastr.error(err, 'Error');
            });

        // created outside function so it can be removed
        var intervalPromise;

        function refresher() {
            // refresh every 3 seconds
            intervalPromise = $interval(function() {
                $http.get('/api/v1/ping/' + dataStore.getToken())
                    .success(function(res) {
                        if (res.setup) {
                            $scope.bar_value = 100;
                            setTimeout(function() {
                                $uibModalInstance.close(true);
                            }, 2000);
                        } else if ($scope.bar_value < 89) {
                            var randomNum = Math.floor(Math.random() * 10) + 5;
                            $scope.bar_value = $scope.bar_value + randomNum;
                        }

                    });
            }, 5000);
        }

        $scope.create = function() {
            $scope.account.aws.type = 'AWS';
            $scope.account.aws.name = 'DEFAULT';
            $scope.account.cms.type = 'CMS';
            $scope.account.cms.name = 'DEFAULT';
            $scope.account.cms.server = 'CHEF';
            $scope.account.user.type = 'USER';

            if ($scope.account.user.password !== $scope.account.user.confirm) {
                return toastr.error('Passwords do not match', 'Error');
            }

            $scope.showSpinner = true;
            $http.post('/api/v1/setup/' + $scope.account.aws.name, $scope.account)
                .success(function(response) {
                    $scope.showSpinner = false;
                    $scope.bar_value = $scope.bar_value + 10;
                    refresher();
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.setActiveTab = function(tab) {
            $scope.activeTab = tab;
        };

        $scope.isFirst = function() {
            return ($scope.activeTab === 'aws-tab');
        };

        $scope.isLast = function() {
            return ($scope.activeTab === 'user-tab');
        };

        //logic for step wizard
        $scope.activeNavTab = function(tab) {
            if ($scope.activeTab === tab) {
                return 'active';
            }
        };

        $scope.activeContentTab = function(tab) {
            if ($scope.activeTab === tab) {
                return 'tab-pane active';
            }
            return 'tab-pane';
        };


        // next decision matrix
        $scope.next = function(tab) {

            if ($scope.activeTab === 'aws-tab') {
                $scope.activeTab = 'chef-tab';
            } else if ($scope.activeTab === 'chef-tab') {
                $scope.activeTab = 'user-tab';
            }

        };

        // previous decision matrix
        $scope.previous = function() {

            if ($scope.activeTab === 'chef-tab') {
                $scope.activeTab = 'aws-tab';
            } else if ($scope.activeTab === 'user-tab') {
                $scope.activeTab = 'chef-tab';
            }

        };

        //stop refresher when the screen is changed
        $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });

        // close modal instance
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };



    });

angular
    .module('stacks')
    .controller('createStack', function($scope, $http, $state, $uibModalInstance, dataStore, _, toastr) {

        $scope.sgs = [];
        $scope.elb_sgs = [];
        $scope.stack = {};
        $scope.stack.instance_store = false;
        $scope.stack.ebs_volume = false;
        $scope.stack.multi_az = false;
        $scope.stack.type = 'create';
        $scope.stack.ebs_root_size = 30;
        $scope.showSpinner = false;
        $scope.stack.volumes = [];
        $scope.stack.recipes = [];
        $scope.activeTab = 'stack-tab';
        $scope.last_name;
        $scope.chef_preview = {
            description: 'Managed by cloudsu',
            json_class: 'Chef::Environment',
            chef_type: 'environment',
            default_attributes: {},
            override_attributes: {}
        };

        $http.get('/api/v1/ec2/sample/images')
            .success(function(response) {
                $scope.images = response;
            });

        $http.get('/api/v1/ec2/sizes')
            .success(function(res) {
                $scope.instanceSizes = res.reverse();
            });


        $http.get('/api/v1/iam/ssl')
            .success(function(res) {
                $scope.ssls = res;
            });

        $http.get('/api/v1/ec2/keys')
            .success(function(res) {
                $scope.keys = res;
            });

        $http.get('/api/v1/iam/roles')
            .success(function(res) {
                $scope.roles = res;
            });

        $http.get('/api/v1/region_map')
            .success(function(response) {
                $scope.regions = response;
            });

        $http.get('/api/v1/ec2/security_groups')
            .success(function(response) {
                $scope.security_groups = response;
            });


        $scope.createStack = function() {

            $scope.showSpinner = true;

            // check for alphas
            if (!$scope.stack.stack_name || $scope.stack.stack_name.match(/[^0-9a-z]/i)) {
                toastr.error('AWS only allows Alphanumeric characters for stack names', 'Error');
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

            if ($scope.stack.build_size === 'HA') {
                //add all az's from region if true
                if ($scope.stack.multi_az) {
                    $scope.stack.regions = $scope.regions;
                } else {
                    $scope.stack.regions = [$scope.stack.region];
                }
            } else {
                $scope.stack.regions = $scope.stack.region;
            }


            //pluck just the sg id
            $scope.stack.elb_security_groups = _.pluck($scope.elb_sgs, 'GroupId');
            $scope.stack.security_groups = _.pluck($scope.sgs, 'GroupId');

            if (!$scope.stack.create_elb) {
                $scope.stack = _.omit($scope.stack, ['elb', 'elb_security_groups']);
            }

            var url = ['/api/v1/stacks', $scope.stack.stack_name].join('/');

            // create new stack
            $http.post(url, $scope.stack)
                .success(function(res) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });

        };

        $scope.envChange = function() {
            // remove last name
            // causes a name for each letter typed
            if ($scope.last_name) {
                const new_defaults = _.omit($scope.chef_preview.default_attributes, [$scope.last_name]);
                $scope.chef_preview.default_attributes = new_defaults;
            }

            if ($scope.stack.stack_name) {
                $scope.chef_preview.name = $scope.stack.stack_name;
            }

            if ($scope.stack.app_name && $scope.stack.app_version) {
                $scope.chef_preview.default_attributes[$scope.stack.app_name] = {};
                $scope.chef_preview.default_attributes[$scope.stack.app_name].version = $scope.stack.app_version;
            }

            if ($scope.stack.domain) {
                $scope.chef_preview.default_attributes.domain = $scope.stack.domain;
            }

            $scope.last_name = _.clone($scope.stack.app_name);
        };

        $scope.setActiveTab = function(tab) {
            $scope.activeTab = tab;
        };

        $scope.isFirst = function() {
            return ($scope.activeTab === 'stack-tab');
        };

        $scope.isLast = function() {
            return ($scope.activeTab === 'scripts-tab');
        };

        //logic for step wizard
        $scope.activeNavTab = function(tab) {
            if ($scope.activeTab === tab) {
                return 'active';
            }
            return;
        };

        $scope.activeContentTab = function(tab) {
            if ($scope.activeTab === tab) {
                return 'tab-pane active';
            }
            return 'tab-pane';
        };


        // next decision matrix
        $scope.next = function(tab) {

            if ($scope.activeTab === 'stack-tab') {
                $scope.activeTab = 'storage-tab';
            } else if ($scope.activeTab === 'storage-tab') {
                if ($scope.stack.build_size === 'HA' && $scope.stack.create_elb) {
                    $scope.activeTab = 'elb-tab';
                } else {
                    $scope.activeTab = 'launch-config-tab';
                }
            } else if ($scope.activeTab === 'elb-tab') {
                $scope.activeTab = 'launch-config-tab';
            } else if ($scope.activeTab === 'launch-config-tab') {
                $scope.activeTab = 'scripts-tab';
            }

        };

        // previous decision matrix
        $scope.previous = function() {

            if ($scope.activeTab === 'storage-tab') {
                $scope.activeTab = 'stack-tab';
            } else if ($scope.activeTab === 'elb-tab') {
                $scope.activeTab = 'storage-tab';
            } else if ($scope.activeTab === 'launch-config-tab') {
                if ($scope.stack.build_size === 'HA' && $scope.stack.create_elb) {
                    $scope.activeTab = 'elb-tab';
                } else {
                    $scope.activeTab = 'storage-tab';
                }
            } else if ($scope.activeTab === 'scripts-tab') {
                $scope.activeTab = 'launch-config-tab';
            }
            return;
        };

        // close modal instance
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        // adds volume from the form
        $scope.addVolume = function() {
            $scope.stack.volumes.push({
                type: 'gp2',
                size: 30
            });
        };

        // removes a volume from the form
        $scope.removeVolume = function(index) {
            $scope.stack.volumes.splice(index, 1);
        };

        // adds security group from the form
        $scope.addSecurityGroup = function(group) {
            $scope.sgs.push(group);
        };

        // removes a security group from the form
        $scope.removeSecurityGroup = function(index) {
            $scope.sgs.splice(index, 1);
        };

        // adds elb security group from the form
        $scope.addElbSecurityGroup = function(group) {
            $scope.elb_sgs.push(group);
        };

        // removes an elb security group from the form
        $scope.removeElbSecurityGroup = function(index) {
            $scope.elb_sgs.splice(index, 1);
        };


    });

angular
    .module('stacks')
    .controller('usersController', function($scope, $http, $state, $uibModal, SweetAlert, dataStore, toastr) {

        //to make the ui render correctly
        $scope.admin = true;

        function refresh() {
            $http.get('api/v1/accounts/')
                .success(function(users) {
                    $scope.users = users;
                    $scope.admin = true;
                })
                .error(function(err) {
                    $scope.admin = false;
                });
        }

        $scope.createUser = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/createUser.html',
                controller: 'createUser',
                size: 'md',
                resolve: {}
            });

            modalInstance.result.then(function() {
                //refresh user to show new
                refresh();
            });
        };

        $scope.editUser = function(user) {
            SweetAlert.swal({
                    title: '',
                    text: 'Switch ' + user.name + ' admin status?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        user.admin = !user.admin;
                        $http.put('/api/v1/accounts/', user)
                            .success(function(response) {
                                refresh();
                                SweetAlert.swal('Success', user.name + ' admin status has been changed to: ' + user.admin, 'success');
                            })
                            .error(function(err) {
                                toastr.error(err, 'Error');
                            });
                    }
                });
        };


        $scope.removeUser = function(user) {
            SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'User will be removed from the database: ' + user.name,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes, delete user!',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        $http.delete('/api/v1/accounts/' + user.name)
                            .success(function(res) {
                                SweetAlert.swal('Success', user.name + ' has been removed.', 'success');
                                refresh();
                            })
                            .error(function(err) {
                                toastr.error(err, 'AWS Error');
                            });
                    }
                });
        };

        //load initial
        refresh();

    });

angular
    .module('stacks')
    .controller('createUser', function($scope, $http, $state, $uibModalInstance, dataStore, _, toastr) {

        // setup defaults
        $scope.token = false;
        $scope.user = {};
        $scope.user.type = 'USER';
        $scope.user.email_pass = false;
        $scope.showSpinner = false;

        $scope.create = function() {

            //ensure password match
            if ($scope.user.password !== $scope.user.confirm &&
                $scope.user.user_type === 'User' &&
                !$scope.user.email_pass) {
                return toastr.error('Passwords do not match', 'Error');
                // ensure password is at least 8 characters
            } else if ($scope.user.user_type === 'Service' || ($scope.user.email_pass && $scope.user.user_type === 'User')) {
                //stub so password length is not hit when it is not used
            } else if ($scope.user.password.length < 8 &&
                $scope.user.user_type === 'User' &&
                !$scope.user.email_pass) {
                return toastr.error('Passwords must be at least 8 characters', 'Error');
            }

            //start spinner
            $scope.showSpinner = true;

            // send create request
            $http.post('/api/v1/accounts', $scope.user)
                .success(function(response) {
                    $scope.showSpinner = false;
                    if (response.service_token) {
                        $scope.token = response.service_token;
                    } else {
                        $uibModalInstance.close('success');
                    }
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.close('success');
        };

    });

angular
    .module('stacks')
    .controller('resetPassword', function($scope, $http, $state, $uibModalInstance, toastr) {

        $scope.showSpinner = false;


        $scope.save = function() {
            if ($scope.user.password !== $scope.user.confirm) {
                return toastr.error('Passwords do not match', 'Error');
            } else if ($scope.user.password < 8) {
                return toastr.error('Passwords must be at least 8 characters', 'Error');
            }

            //start show spinner
            $scope.showSpinner = true;

            $http.put('/api/v1/accounts/reset', $scope.user)
                .success(function(response) {
                    $scope.showSpinner = false;
                    $uibModalInstance.dismiss('cancel');
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

angular
    .module('stacks')
    .controller('system', function($scope, $http, $uibModal, dataStore, SweetAlert, toastr) {

        //to make the ui render correctly
        $scope.admin = true;

        // refresh aws accounts
        function refresh() {
            $http.get('/api/v1/services/get_accounts/AWS')
                .success(function(response) {
                    $scope.admin = true;
                    $scope.aws_accounts = response;
                })
                .error(function(err) {
                    $scope.admin = false;
                });
        }

        //open modal to edit chef
        $scope.chefModal = function() {
            $http.get('/api/v1/services/get_account/CMS/DEFAULT')
                .success(function(response) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/chef.html',
                        size: 'md',
                        controller: 'serviceAccount',
                        resolve: {
                            account: function() {
                                return response;
                            },
                            type: function() {
                                return 'CMS';
                            }
                        }
                    });

                })
                .error(function(err) {
                    toastr.error(err, 'Error');
                });
        };

        // open aws account modal
        $scope.awsModal = function(account) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/aws.html',
                size: 'md',
                controller: 'serviceAccount',
                resolve: {
                    account: function() {
                        return account;
                    },
                    type: function() {
                        return 'AWS';
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                //refresh stacks to show newly created stack
                refresh();
                // run refresh on parent controller
                $scope.startup();
            });
        };

        // remove service account
        $scope.removeAccount = function(account) {
            SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'Account will be removed: ' + account.name,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#1ab394',
                    confirmButtonText: 'Yes',
                    closeOnConfirm: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        $http.delete(['/api/v1/services', account.type, account.name].join('/'))
                            .success(function(response) {
                                SweetAlert.swal('Success', account.name + ' has been removed.', 'success');
                                // refresh system accounts
                                refresh();
                                //revert back to default after deleting
                                $scope.activateAccount('DEFAULT');
                                // refresh parent controller
                                $scope.startup();
                            })
                            .error(function(err) {
                                toastr.error(err, 'Error');
                            });
                    }
                });
        };

        //export system config (db config)
        $scope.exportConfig = function() {
            $scope.toJSON = '';
            $scope.showSpinner = true;
            $http.get('/api/v1/system/export')
                .success(function(config) {
                    $scope.toJSON = angular.toJson(config);
                    var blob = new Blob([$scope.toJSON], {
                        type: 'application/json;charset=utf-8;'
                    });
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', window.URL.createObjectURL(blob));
                    downloadLink.attr('download', 'secrets.json');
                    downloadLink[0].click();
                })
                .error(function(err) {
                    toastr.error(err, 'Error');
                });
        };


        // load initial data
        refresh();


    });

angular
    .module('stacks')
    .controller('serviceAccount', function($scope, $http, $uibModalInstance, dataStore, _, account, type, toastr) {

        $scope.account = account || {};
        $scope.account.type = type;
        $scope.showSpinner = false;

        $scope.saveServiceAccount = function() {

            //show show spinner
            $scope.showSpinner = true;

            //save account in database
            $http.post('/api/v1/services/save_account', $scope.account)
                .success(function(res) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

angular
    .module('stacks')
    .controller('upgradeStack', function($scope, $http, $uibModalInstance, dataStore, toastr, stack_name, build_size) {

        $scope.advanced = false;
        $scope.stack = {};
        $scope.stack.type = 'upgrade';
        $scope.stack.stack_name = stack_name;
        $scope.showSpinner = false;
        $scope.upgrade_options = true;
        $scope.build_size = build_size;


        $http.get('/api/v1/ec2/sizes')
            .success(function(response) {
                $scope.instanceSizes = response;
            });

        $http.get('/api/v1/chef/environments/' + stack_name)
            .success(function(response) {

                var defaults = response.default_attributes;
                if (defaults) {
                    var chef = defaults.cloudsu_params;
                    $scope.stack.min_size = chef.min_size;
                    $scope.stack.desired_size = chef.desired_size;
                    $scope.stack.max_size = chef.max_size;
                    $scope.current_version = chef.app_version;
                    $scope.stack.ami = chef.ami;
                    $scope.stack.instance_size = chef.instance_size;
                    $scope.stack.app_name = chef.app_name;
                }

            });

        $scope.upgrade = function() {

            //show spinner
            $scope.showSpinner = true;

            $http.patch('/api/v1/upgrade', $scope.stack)
                .success(function(data) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

// model editor view
angular
    .module('stacks')
    .controller('templateEditor', function($scope, $http, $uibModalInstance, template, stack_name, dataStore, toastr) {

        $scope.name = stack_name;
        $scope.showSpinner = false;

        $scope.myInitCallback = function(editor) {
            var o = JSON.parse(template);
            $scope.editorData = JSON.stringify(o, null, 4);
            editor.$blockScrolling = Infinity;
            editor.session.setMode('ace/mode/json');
            editor.setOption('showPrintMargin', false);
            editor.getSession()
                .setTabSize(4);
        };

        $scope.onDeploy = function() {

            //start spinner
            $scope.showSpinner = true;

            $http.put('/api/v1/stacks/' + stack_name, {
                    'template': $scope.editorData,
                    'stack_name': stack_name
                })
                .success(function(data) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close();
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

angular
    .module('stacks')
    .controller('stackRollback', function($scope, $http, $uibModalInstance, stack_name, dataStore, toastr) {

        $scope.stack_name = stack_name;
        $scope.showSpinner = false;


        $http.get('/api/v1/chef/rollback_check/' + $scope.stack_name)
            .success(function(response) {
                $scope.rollback_available = response;
            })
            .error(function(err) {
                toastr.error(err, 'Error');
            });

        $scope.rollback = function() {
            $scope.showSpinner = true;
            $http.patch('/api/v1/upgrade/rollback', {
                    stack_name: $scope.stack_name
                })
                .success(function(response) {
                    $scope.showSpinner = false;
                    $uibModalInstance.dismiss('cancel');
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };


    });

angular
    .module('stacks')
    .controller('groupResize', function($scope, $http, $uibModalInstance, stack_name, app_name, version, dataStore, toastr) {

        $scope.showSpinner = false;

        var params = {
            stack_name: stack_name,
            app_name: app_name,
            version: version
        };

        $scope.adjustSize = function() {
            $scope.showSpinner = true;
            params = _.extend(params, $scope.adjust);
            $http.patch('/api/v1/adjust_size', params)
                .success(function(response) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

angular
    .module('stacks')
    .controller('connectElb', function($scope, $http, $uibModalInstance, elbs, scale_group, dataStore, toastr) {

        $scope.elbs = elbs;
        $scope.showSpinner = false;


        $scope.connect = function() {
            $scope.showSpinner = true;
            $http.patch('/api/v1/elb/connect', {
                    scale_group: scale_group,
                    elb: $scope.elb_name
                })
                .success(function(data) {
                    $scope.showSpinner = false;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'AWS Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

// model editor view
angular
    .module('stacks')
    .controller('chefEditor', function($scope, $http, $uibModalInstance, environment, dataStore, toastr) {

        $scope.showSpinner = false;
        $scope.name = environment.name;

        $scope.myInitCallback = function(editor) {
            var string = JSON.stringify(environment, null, 4);
            $scope.editorData = string;
            editor.$blockScrolling = Infinity;
            editor.session.setMode('ace/mode/json');
            editor.getSession().setTabSize(4);
            editor.setOption('showPrintMargin', false);

        };

        $scope.onDeploy = function() {
            $scope.showSpinner = true;
            $http.put('/api/v1/chef/environments/update', $scope.editorData)
                .success(function(data) {
                    $scope.showSpinner = false;
                    $uibModalInstance.dismiss();
                })
                .error(function(err) {
                    $scope.showSpinner = false;
                    toastr.error(err, 'Chef Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });

angular
    .module('stacks')
    .controller('import', function($scope, $http, $uibModalInstance, toastr) {

        $scope.showSpinner = false;


        $scope.importConfig = function() {
            $scope.showSpinner = true;
            if (!$scope.config) {
                $scope.showSpinner = true;
                return;
            }
            $http.post('/api/v1/system/import', $scope.config)
                .success(function(response) {
                    $scope.showSpinner = true;
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.showSpinner = true;
                    toastr.error(err, 'Error');
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };


    });
