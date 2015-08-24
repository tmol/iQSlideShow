/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('slideshows').factory('Templates', ['$resource',
        function ($resource) {
            return $resource('templates', {}, {
                getAll : {method: 'GET', isArray: true}
            });
        }]);
}());
