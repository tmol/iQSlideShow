/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides', 'Slideshows', 'MessagingEngineFactory', 'Admin',
        function ($scope, $state, $stateParams, Slides, Slideshows, MessagingEngineFactory, Admin) {
            $scope.deviceId = $stateParams.deviceId;
            $scope.slideshowId = $stateParams.slideshowId;
            var messagingEngine = MessagingEngineFactory.getEngine();
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });
            Slides.get({slideId : $stateParams.slideshowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                $scope.slideUrl = slide.detailsUrl || $state.href("player", {
                    slideName : $scope.slideshowId,
                    slideNumber : $scope.slideNumber
                }, {absolute : true});
            });

            $scope.setSlideShow = function () {
                Admin.get(function (config) {
                    messagingEngine.publishToDeviceChannel('switchSlide', $scope.deviceId, {
                        slideShowIdToPlay: $scope.slideShowId,
                        minutesToPlayBeforeGoingBackToDefaultSlideShow : config.userSelectedSlideShowsPlayTimeInMinutes
                    });
                }, function (err) {
                    throw err;
                });
            };

            $scope.goToPreviousSlide = function () {
                messagingEngine.publishToDeviceChannel('moveSlideLeft', $scope.deviceId);
            };

            $scope.goToNextSlide = function () {
                messagingEngine.publishToDeviceChannel('moveSlideRight', $scope.deviceId);
            };

            $scope.holdSlideShow = function () {
                messagingEngine.publishToDeviceChannel('holdSlideShow', $scope.deviceId);
            };

            $scope.resetSlideShow = function () {
                messagingEngine.publishToDeviceChannel('resetSlideShow', $scope.deviceId);
            };

        }]);
}());
