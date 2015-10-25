/*global angular*/
(function () {
    'use strict';

    angular.module('slideshows').factory('SlideBlueprints', ['$resource',
        function ($resource) {
            return $resource('slideBlueprints/slides/:slideId', {slideId: '@slideId'}, {
                update: {
                    method: 'PUT'
                },
                getByFilter: {
                    method: 'POST',
                    url: 'slideBlueprints/slides/byFilter',
                    data: {filters: "@filters"},
                    isArray: true
                }
            });
        }]);
}());
