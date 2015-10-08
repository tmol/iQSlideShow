/*global angular*/
(function () {
    'use strict';

    angular.module('admin').factory('Admin', ['$resource',
        function ($resource) {
            return $resource('admin', {}, {
                getConfig: {
                    method: 'GET',
                    url: 'admin/config'
                },
                updateConfig: {
                    method: 'PUT',
                    url: 'admin/config'
                },
                reload: {
                    method: 'GET',
                    url: 'admin/reload'
                },
                getLocations: {
                    method: 'GET',
                    url: 'admin/location',
                    isArray: true
                },
                saveLocation: {
                    method: 'POST',
                    url: 'admin/location'
                }
            });
        }
        ]);
}());