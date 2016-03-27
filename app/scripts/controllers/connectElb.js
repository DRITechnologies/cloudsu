angular
    .module('stacks')
    .controller('connectElb', function($scope, $http, $uibModalInstance, elbs, scale_group, dataStore) {

        $scope.alerts = [];
        $scope.elbs = elbs;


        $scope.connect = function() {
            $http.patch('/api/v1/elb/connect', {
                    scale_group: scale_group,
                    elb: $scope.elb_name
                })
                .success(function(data) {
                    $uibModalInstance.close(true);
                })
                .error(function(err) {
                    $scope.alerts.push({
                        type: 'danger',
                        msg: err
                    });
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.close_alert_modal = function(index) {
            $scope.alerts.splice(index, 1);
        };

    });
