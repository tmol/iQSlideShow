/*global angular*/
(function () {
    'use strict';

    angular.module('player').factory('Audit', ['$resource',
        function ($resource) {
            return $resource('/audits', {}, {
                report: {
                    method: 'POST'
                }
            });
        }
        ]);
}());
