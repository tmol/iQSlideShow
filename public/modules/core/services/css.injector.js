/*global angular, jQuery*/
(function () {
    'use strict';
    angular.module('core').factory("CssInjector", function ($timeout, $http, $rootScope) {
        var head = jQuery(document.getElementsByTagName('head')[0]);

        var cssCollection = {};
        var injectCss = function (css, callback) {
            if (cssCollection[css]) {
                if (callback) {
                    callback();
                }
                return;
            }
            $http({
                url: css,
                cache: true
            }).success(function (result) {
                cssCollection[css] = jQuery("<style>" + result + "</style>");
                head.append(cssCollection[css]);
                if (callback) {
                    callback();
                }
            });
        };
        $rootScope.$on("slideContextUnloaded", function () {
            var name;
            for (name in cssCollection) {
                if (cssCollection.hasOwnProperty(name)) {
                    cssCollection[name].remove();
                }
            }
            cssCollection = [];
        });
        return {
            inject: function (scope, cssPath, callback) {
                injectCss(cssPath, callback);
            }
        };
    });
}());
