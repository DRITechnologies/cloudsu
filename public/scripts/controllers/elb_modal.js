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