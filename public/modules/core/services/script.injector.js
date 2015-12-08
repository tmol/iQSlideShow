/*global angular, jQuery*/
(function () {
    'use strict';
    angular.module('core').factory("ScriptInjector", function ($timeout, $http, $rootScope) {
        var head = document.getElementsByTagName("head")[0] || document.documentElement;

        var scriptCollection = {};
        var injectScript = function (scriptUrl) {
            if (scriptCollection[scriptUrl]) {
                $rootScope.$broadcast("scriptCached", scriptUrl);
                return;
            }

            var script = document.createElement("script");
            scriptCollection[scriptUrl] = script;
            script.async = "async";
            script.type = "text/javascript";
            script.src = scriptUrl;
            script.onload = script.onreadystatechange = function (_, isAbort) {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    if (isAbort) {
                        $rootScope.$broadcast("errorOnLoadScript", scriptUrl);
                    } else {
                        $rootScope.$broadcast("scriptLoaded", scriptUrl);
                        console.log('scriptLoaded broadcasted for: ' + scriptUrl);
                    }
                }
            };
            script.onerror = function () {
                $rootScope.$broadcast("errorOnLoadScript", scriptUrl);
            };
            head.appendChild(script);
        };
        $rootScope.$on("slideContextUnloaded", function () {
            var name;
            for (name in scriptCollection) {
                if (scriptCollection.hasOwnProperty(name)) {
                    scriptCollection[name].remove();
                }
            }
            scriptCollection = [];
        });
        return {
            inject: injectScript
        };
    });
}());
