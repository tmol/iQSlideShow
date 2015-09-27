/*global angular*/
(function () {
    'use strict';

    angular.module('player').factory('HealthReporter', ['$resource',
        function ($resource) {
            return $resource('/devices/healthReport/:deviceId', {deviceId: '@deviceId'}, {
                report: {
                    method: 'POST'
                }
            });
        }
        ]);
}());