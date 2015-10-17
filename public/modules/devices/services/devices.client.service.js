/*global angular*/
(function () {
    'use strict';

    //Devices service used to communicate Devices REST endpoints
    angular.module('devices').factory('Devices', ['$resource',
        function ($resource) {
            return $resource('/devices/:deviceId', { deviceId: '@deviceId', locationName: '@locationName'}, {
                filter: {
                    method: 'GET',
                    isArray: true
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
        }
                                                 ]);

}());
