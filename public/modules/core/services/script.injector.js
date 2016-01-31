/*global angular, jQuery*/
(function () {
    'use strict';
    angular.module('core').factory("ScriptInjector", function ($timeout, $http, $rootScope) {
        var scriptCollection = {};
        var loadedScripts = {};
        $rootScope.$on("whenScriptLoaded", function(e, url, callback) {
            if (loadedScripts[url]) {
                callback();
            } else {
                $rootScope.$on("scriptLoaded", function (event, scriptUrl, scriptTag) {
                    if (scriptTag == url) {
                        callback();
                    }
                });
            }
        });


        var head = document.getElementsByTagName("head")[0] || document.documentElement;


        var injectScript = function (scriptUrl, scriptTag) {
            if (scriptCollection[scriptTag]) {
                $rootScope.$broadcast("scriptCached", scriptUrl, scriptTag);
                return;
            }

            var script = document.createElement("script");
            scriptCollection[scriptTag] = script;
            script.async = "async";
            script.type = "text/javascript";
            script.src = scriptUrl;
            script.onload = script.onreadystatechange = function (_, isAbort) {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    if (isAbort) {
                        $rootScope.$broadcast("errorOnLoadScript", scriptUrl, scriptTag);
                    } else {
                        $rootScope.$broadcast("scriptLoaded", scriptUrl, scriptTag);

                        loadedScripts[scriptTag] = true;
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
