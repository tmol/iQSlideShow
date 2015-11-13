/*global angular*/
(function () {
    'use strict';

    angular.module('blueprints').factory('SlideBlueprints', ['$resource',
        function ($resource) {
            return $resource('slideBlueprints/slides/:slideId', {slideId: '@slideId'}, {
                update: {
                    method: 'PUT'
                },
                getByFilter: {
                    method: 'GET',
                    url: 'slideBlueprints/slidesByFilter',
                    isArray: true
                },
                getFilteredNamesAndTags:  {
                    method: 'GET',
                    url: '/slideBlueprints/filteredNamesAndTags'
                }
            });
        }]);
}());
