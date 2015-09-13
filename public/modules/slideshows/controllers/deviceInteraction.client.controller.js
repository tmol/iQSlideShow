/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides', 'Slideshows', 'MessagingEngineFactory',
        function ($scope, $state, $stateParams, Slides, Slideshows, MessagingEngineFactory) {
            $scope.deviceId = $stateParams.deviceId;
            var messagingEngine = MessagingEngineFactory.getEngine();
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });
            Slides.get({slideId : $stateParams.slideshowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                $scope.slideUrl = slide.detailsUrl || $state.href("player", {
                    slideName : $stateParams.slideshowId,
                    slideNumber : $stateParams.slideNumber
                }, {absolute : true});
            });

            $scope.setSlideShow = function (device) {
                messagingEngine.publish('switchSlide', $scope.deviceId, {
                    slideShowIdToPlay: device.slideShowId,
                    minutesToPlayBeforeGoingBackToDefaultSlideShow : ApplicationConfiguration.minutesToPlayBeforeGoingBackToDefaultSlideShow
                });
            };

            $scope.goToPreviousSlide = function () {
                messagingEngine.publish('moveSlideLeft', $scope.deviceId);
            };

            $scope.goToNextSlide = function () {
                messagingEngine.publish('moveSlideRight', $scope.deviceId);
            };

            $scope.holdSlideShow = function () {
                messagingEngine.publish('holdSlideShow', $scope.deviceId);
            };

            $scope.resetSlideShow = function () {
                messagingEngine.publish('resetSlideShow', $scope.deviceId);
            };

        }]);
}());
