/*global angular*/
(function () {
    'use strict';

    angular.module('admin').factory('Admin', ['$resource',
        function ($resource) {
            return $resource('admin', { locationId: '@_id'}, {
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
                },
                updateLocation: {
                    method: 'PUT',
                    url: 'admin/location/:locationId'
                },
                deleteLocation: {
                    method: 'DELETE',
                    url: 'admin/location/:locationId'
                }
            });
        }
        ]);
}());