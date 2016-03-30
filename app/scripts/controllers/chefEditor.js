// model editor view
angular
    .module('stacks')
    .controller('chefEditor', function($scope, $http, $uibModalInstance, environment,
        dataStore) {

        $scope.alerts = [];
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
