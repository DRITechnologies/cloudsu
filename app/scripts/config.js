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
