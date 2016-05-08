/*global angular*/
(function () {
    'use strict';

    //Slideshows service used to communicate Slideshows REST endpoints
    angular.module('player').factory('DeviceInteractionService', ['$http',
        function ($http) {
            return {
                getSlideShowsByFilter: function(filter, callback) {
                    $http({
                    method: 'GET',
                    isArray: true,
                    url: '/deviceInteraction/slideshows/filter',
                    params: filter}).then(callback);
                },
                getSlideShowsByName: function(filter, callback) {
                    $http({
                    method: 'GET',
                    url: '/deviceInteraction/slideshows/filterByName',
                    params: filter,
                    isArray: true }).then(callback);
                }
            };
        }]);
}());
