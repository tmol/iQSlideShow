/*global angular*/
(function () {
    'use strict';

    //Setting up route
    angular.module('slideshows').config(['$stateProvider',
        function ($stateProvider) {
            // Slideshows state routing
            $stateProvider.
                state('devices', {
                    url: '/devices',
                    templateUrl: 'modules/slideshows/views/devices.client.view.html'
                }).
                state('deviceInteraction', {
                    url: '/deviceInteraction/:deviceId/:slideshowId/:slideNumber',
                    templateUrl: 'modules/slideshows/views/deviceInteraction.client.view.html'
                }).
                state('listSlideshows', {
                    url: '/slideshows',
                    templateUrl: 'modules/slideshows/views/list-slideshows.client.view.html'
                }).
                state('createSlideshow', {
                    url: '/slideshows/create',
                    templateUrl: 'modules/slideshows/views/create-slideshow.client.view.html'
                }).
                state('viewSlideshow', {
                    url: '/slideshows/:slideshowId',
                    templateUrl: 'modules/slideshows/views/view-slideshow.client.view.html'
                }).
                state('editSlideshow', {
                    url: '/slideshows/:slideshowId/edit',
                    templateUrl: 'modules/slideshows/views/edit-slideshow.client.view.html'
                });
        }]);
}());
