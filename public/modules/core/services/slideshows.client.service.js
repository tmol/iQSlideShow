/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('core').factory('Slideshows', ['$resource',
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
                },
                getFilteredNamesAndTags:  {
                    method: 'GET',
                    url: '/slideshows/filteredNamesAndTags'
                },
                filter:  {
                    method: 'GET',
                    url: '/slideshows/filter',
                    isArray: true
                },
                filterByName: {
                    method: 'GET',
                    url: '/slideshows/filterByName',
                    isArray: true
                }
            });
        }]);
}());
