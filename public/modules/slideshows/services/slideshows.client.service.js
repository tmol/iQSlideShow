/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('slideshows').factory('Slideshows', ['$resource',
        function ($resource) {
            return $resource('slideshows/:slideshowId',
                {
                    slideshowId: '@_id'
                },
                {
                    update:  {
                        method: 'PUT'
                    },
                    getFilteredNamesAndTags:  {
                        method: 'GET',
                        url: '/slideshows/filteredNamesAndTags'
                    },
                    filter:  {
                        method: 'GET',
                        url: '/slideshows/filter',
                        isArray: true
                    }
                });
        }]);
}());
