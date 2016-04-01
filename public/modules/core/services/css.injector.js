/*global angular, jQuery*/
(function () {
    'use strict';
    angular.module('core').factory("CssInjector", function ($timeout, $http, $rootScope, Path) {
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
                var cssPathArray = css.split("/");
                delete cssPathArray[cssPathArray.length-1];
                result = result.replace(/\[RELATIVE\-PATH\]/g,cssPathArray.join("/"));

                cssCollection[css] = jQuery("<style>" + result + "</style>");
                head.append(cssCollection[css]);
                if (callback) {
                    callback();
                }
            }).error(function () {
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
