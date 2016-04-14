(function () {
    'use strict';

    // Setting up route
    angular.module('core').config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider.state('terms', {
                url: '/terms',
                templateUrl: 'modules/core/views/terms.html'
            }).state('privacy', {
                url: '/privacy',
                templateUrl: 'modules/core/views/privacy.html'
            })
            // Redirect to home view when route not found
            $urlRouterProvider.otherwise('/slideshows');
        }
    ]);
}());
