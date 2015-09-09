/*global angular*/
(function () {
    'use strict';

    angular.module('admin').factory('Admin', ['$resource',
        function ($resource) {
            return $resource('admin', {}, {
                update: {
                    method: 'PUT'
                }
            });
        }
        ]);
}());