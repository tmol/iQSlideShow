/*global angular*/
(function () {
    'use strict';

    //Setting up route
    angular.module('admin').config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider.state('reload', {
                url: '/reload',
                templateUrl: 'modules/admin/views/reload.client.view.html'
            }).state('admin', {
                url: '/admin',
                templateUrl: 'modules/admin/views/admin.client.view.html'
            }).state('locations', {
                url: '/locations',
                templateUrl: 'modules/admin/views/locations.client.view.html'
            }).state('audit', {
                url: '/audit',
                templateUrl: 'modules/admin/views/audit.client.view.html'
            });
        }
        ]);
}());
