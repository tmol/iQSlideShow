/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('slideshows').factory('Tags', ['$resource',
        function ($resource) {
            return $resource('tags/:tag',
                             { tag: '@_tag' });
        }]);
}());
