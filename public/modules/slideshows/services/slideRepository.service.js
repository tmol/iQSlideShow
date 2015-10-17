/*global angular*/
(function () {
    'use strict';

    angular.module('slideshows').factory('SlidesRepository', ['$resource',
        function ($resource) {
            return $resource('repository/slides/:slideId',
                             { slideId: '@slideId' },
                             { update:
                              {method: 'PUT'}
                             });
        }]);
}());
