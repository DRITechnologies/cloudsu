// model editor view
angular
    .module('stacks')
    .controller('stack_editor_modal', function ($scope, $http, $modalInstance, template, stack_name,
        dataStore) {
        $scope.alerts_modal = [];
        $scope.name = stack_name;
        var templateBody;

        $scope.ready = function () {
            var editor = ace.edit('editor');
            editor.getSession()
                .setMode('ace/mode/json');
            editor.setTheme('ace/theme/solarized_dark');
            var _session = editor.getSession();
            var o = JSON.parse(template);
            var val = JSON.stringify(o, null, 4);
            editor.$blockScrolling = Infinity;
            editor.getSession()
                .setTabSize(4);
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
                })
                .success(function (data) {
                    $modalInstance.dismiss();
                    dataStore.addAlert('success', 'successfully updated stack');
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
