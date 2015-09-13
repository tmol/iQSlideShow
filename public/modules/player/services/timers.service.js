/*jslint nomen: true, vars: true*/
/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('player').factory('Timers', ['$timeout',
        function ($timeout) {
            var timeoutCollection = {};

            var registerTimeout = function (key, func, delay) {
                $timeout.cancel(timeoutCollection[key]);
                timeoutCollection[key] = $timeout(func, delay);
            };

            var unRegisterTimeout = function (key) {
                $timeout.cancel(timeoutCollection[key]);
                delete timeoutCollection[key];
            };

            var resetTimeouts = function () {
                var prop;
                for (prop in timeoutCollection) {
                    if (timeoutCollection.hasOwnProperty(prop)) {
                        $timeout.cancel(timeoutCollection[prop]);
                    }
                }
                timeoutCollection = {};
            };
            return {
                registerTimeout : registerTimeout,
                unRegisterTimeout : unRegisterTimeout,
                resetTimeouts : resetTimeouts
            };
        }]);
}());
