/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('slideshows').factory('SlideshowTags', ['$resource',
        function ($resource) {
            return $resource('slideshowtags/:tag',
                             { tag: '@_tag' });
        }]);
}());
