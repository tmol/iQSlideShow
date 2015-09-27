/*global angular*/
(function () {
    'use strict';

    angular.module('player').factory('LocalStorage', ['$window',
        function ($window) {
            return {
                setDeviceId: function (val) {
                    if ($window.localStorage) {
                        $window.localStorage.setItem('deviceId', val);
                    }
                    return this;
                },
                getDeviceId: function () {
                    return $window.localStorage && $window.localStorage.getItem('deviceId');
                }
            };
        }
        ]);
}());