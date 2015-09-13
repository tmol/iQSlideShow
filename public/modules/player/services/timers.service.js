/*jslint nomen: true, vars: true*/
/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('player').factory('Timers', ['$timeout',
        function ($timeout) {
            return function () {
                var timeoutCollection = {};

                this.registerTimeout = function (key, func, delay) {
                    $timeout.cancel(timeoutCollection[key]);
                    timeoutCollection[key] = $timeout(func, delay);
                };

                this.unRegisterTimeout = function (key) {
                    $timeout.cancel(timeoutCollection[key]);
                    delete timeoutCollection[key];
                };

                this.resetTimeouts = function () {
                    var prop;
                    for (prop in timeoutCollection) {
                        if (timeoutCollection.hasOwnProperty(prop)) {
                            $timeout.cancel(timeoutCollection[prop]);
                        }
                    }
                    timeoutCollection = {};
                };
            };
        }]);
}());
