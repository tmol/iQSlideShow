/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('slideshows').factory('Slideshows', ['$resource',
        function ($resource) {
            return $resource('slideshows/:slideshowId', {
                slideshowId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                getDevices: {
                    method: 'GET',
                    url: 'slideshowDevices/:slideshowId',
                    isArray: true,
                    params: {name: '@name'}
                },
                setDevices: {
                    method: 'PUT',
                    url: 'slideshowDevices/:slideshowId'
                }
            });
        }]);
}());
