/*global angular*/
(function () {
    'use strict';

    //Setting up route
    angular.module('slideshows').config(['$stateProvider',
        function ($stateProvider) {
            // Slideshows state routing
            $stateProvider.
                state('deviceInteraction', {
                    url: '/deviceInteraction/:deviceId/:slideShowId/:slideNumber',
                    templateUrl: 'modules/slideshows/views/deviceInteraction.client.view.html',
                    noApplicationHeader: true,
                    interactionMode: true
                }).
                state('listSlideshows', {
                    url: '/slideshows',
                    templateUrl: 'modules/slideshows/views/list-slideshows.client.view.html'
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
