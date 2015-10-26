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
                    method: 'POST',
                    url: 'slideBlueprints/slides/byFilter',
                    data: {filters: "@filters"},
                    isArray: true
                }
            });
        }]);
}());
