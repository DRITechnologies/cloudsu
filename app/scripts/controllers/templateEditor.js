// model editor view
angular
    .module('stacks')
    .controller('templateEditor', function($scope, $http, $uibModalInstance, template, stack_name,
        dataStore) {

        $scope.alerts = [];
        $scope.name = stack_name;

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
            $http.put('/api/v1/stacks/' + stack_name, {
                    'template': $scope.editorData,
                    'stack_name': stack_name
                })
                .success(function(data) {
                    $uibModalInstance.close();
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

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

    });
