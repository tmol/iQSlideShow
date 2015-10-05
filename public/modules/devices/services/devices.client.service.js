/*global angular*/
(function () {
    'use strict';

    //Devices service used to communicate Devices REST endpoints
    angular.module('devices').factory('Devices', ['$resource',
        function ($resource) {
            return $resource('/devices/:deviceId', { deviceId: '@deviceId'}, {
                update: {
                    method: 'PUT'
                },
                create: {
                    method: 'POST',
                    url: '/devices'
                }
            });
        }
                                                 ]);

}());
