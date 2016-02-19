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