/*global angular*/
(function () {
    'use strict';

    //Setting up route
    angular.module('admin').config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider.state('admin', {
                url: '/admin',
                templateUrl: 'modules/admin/views/admin.client.view.html'
            });
        }
        ]);
}());