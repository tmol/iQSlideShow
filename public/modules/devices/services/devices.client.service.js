/*global angular*/
(function () {
    'use strict';

    //Devices service used to communicate Devices REST endpoints
    angular.module('devices').factory('Devices', ['$resource',
        function ($resource) {
            return $resource('/devices/:deviceId', {
                deviceId: '@deviceId',
                locationName: '@locationName',
                nameFilter: '@nameFilter'
            }, {
                list: {
                    method: 'GET',
                    isArray: true
                },
                getFilteredNames: {
                    method: 'GET',
                    url: '/devices/names'
                },
                update: {
                    method: 'PUT'
                },
                create: {
                    method: 'POST',
                    url: '/devices'
                },
                getByLocationName: {
                    method: 'GET',
                    url: '/devices/byLocation/:locationName',
                    isArray: true
                }
            });
        }]);
}());
