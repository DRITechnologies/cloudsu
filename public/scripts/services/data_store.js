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
