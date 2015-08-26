/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides', 'Devices', 'Slideshows', 'PubNub',
        function ($scope, $state, $stateParams, Slides, Devices, Slideshows, PubNub) {
            PubNub.init({
                publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
                subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
                uuid : $stateParams.deviceId
            });
            var theChannel = 'iQSlideShow';

            $scope.deviceId = $stateParams.deviceId;
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
                PubNub.ngPublish({
                    channel: theChannel,
                    message: {
                        action : action,
                        deviceId  : $stateParams.deviceId,
                        content : content
                    }
                });
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
