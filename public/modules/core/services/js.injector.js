/*global angular*/
(function () {
    'use strict';
    angular.module('core').factory("JsInjector", function ($http) {
        var jsNotFound = {};
        var injectJs = function (jsUrl, callback) {
            if (jsNotFound[jsUrl]) {
                (callback || function () {return; })(null);
                return;
            }
            $http({
                url: jsUrl,
                cache: true
            }).success(function (result) {
                var func = null;
                eval("func=" + result);
                (callback || function () {return; })(func);
            }).error(function () {
                jsNotFound[jsUrl] = true;
                if (callback) {
                    callback(null);
                }
            });
        };

        return {
            inject: injectJs
        };
    });
}());
