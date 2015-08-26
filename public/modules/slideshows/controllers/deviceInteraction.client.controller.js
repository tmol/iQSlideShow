/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides', 'Devices', 'Slideshows', 'MessagingEngineFactory',
        function ($scope, $state, $stateParams, Slides, Devices, Slideshows, MessagingEngineFactory) {
            $scope.deviceId = $stateParams.deviceId;
            var messagingEngine = MessagingEngineFactory.getEngine($scope.deviceId);
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });
            Devices.get({deviceId : $stateParams.deviceId}, function (res) {
                $scope.device = res.device;
            });
            Slides.get({slideId : $stateParams.slideshowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                $scope.slideUrl = slide.detailsUrl || $state.href("player", {
                    slideName : $stateParams.slideshowId,
                    slideNumber : $stateParams.slideNumber
                }, {absolute : true});
            });

            var publishMessage = function (action, content) {
                content = content || {};
                messagingEngine.publish(action, content);
            };

            $scope.setSlideShow = function (device) {
                publishMessage('deviceSetup', {
                    slideShowIdToPlay: device.slideShowId,
                    minutesToPlayBeforeGoingBackToDefaultSlideShow : ApplicationConfiguration.minutesToPlayBeforeGoingBackToDefaultSlideShow
                });
            };

            $scope.goToPreviousSlide = function () {
                publishMessage('moveSlideLeft');
            };

            $scope.goToNextSlide = function () {
                publishMessage('moveSlideRight');
            };

            $scope.holdSlideShow = function () {
                publishMessage('holdSlideShow');
            };

            $scope.resetSlideShow = function () {
                publishMessage('resetSlideShow');
            };

        }]);
}());
