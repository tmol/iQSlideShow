/*global angular*/
(function () {
    'use strict';

    //Setting up route
    angular.module('blueprints').config(['$stateProvider',
        function ($stateProvider) {
            // Slideshows state routing
            $stateProvider.
                state('blueprints', {
                    url: '/blueprints',
                    controller: 'BlueprintsController',
                    templateUrl: 'modules/blueprints/views/blueprints.client.view.html'
                });
        }]);
}());
