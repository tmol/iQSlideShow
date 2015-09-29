/*jslint nomen: true, vars: true*/
/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('core').factory('Timers', ['$timeout', '$interval',
        function ($timeout, $interval) {
            return function () {
                var timeoutCollection = {};
                var intervalCollection = {};

                this.registerTimeout = function (key, func, delay) {
                    $timeout.cancel(timeoutCollection[key]);
                    timeoutCollection[key] = $timeout(func, delay);
                };

                this.registerInterval = function (key, func, delay) {
                    $interval.cancel(intervalCollection[key]);
                    intervalCollection[key] = $interval(func, delay);
                };

                this.unRegisterTimeout = function (key) {
                    $timeout.cancel(timeoutCollection[key]);
                    delete timeoutCollection[key];
                };

                this.unRegisterInterval = function (key) {
                    $interval.cancel(intervalCollection[key]);
                    delete intervalCollection[key];
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

                this.resetIntervals = function () {
                    var prop;
                    for (prop in intervalCollection) {
                        if (intervalCollection.hasOwnProperty(prop)) {
                            $interval.cancel(intervalCollection[prop]);
                        }
                    }
                    intervalCollection = {};
                };
            };
        }]);
}());
