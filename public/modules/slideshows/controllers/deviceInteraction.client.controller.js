/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'Slideshows', 'DeviceMessageBroker', 'Admin',
        function ($scope, $stateParams, Slides, Slideshows, DeviceMessageBroker, Admin) {
            $scope.deviceId = $stateParams.deviceId;
            $scope.slideshowId = $stateParams.slideshowId;
            var messageBroker = new DeviceMessageBroker($scope.deviceId);
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            Slides.get({slideId : $stateParams.slideShowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                $scope.slideUrl = slide.detailsUrl || "/slideshow#!/preview/" + $stateParams.slideShowId + "/" + $stateParams.slideNumber;
            });

            $scope.setSlideShow = function () {
                Admin.getConfig(function (config) {
                    var slideShowName = _.filter($scope.slideshows, {_id: $scope.slideShowId})[0].name;
                    messageBroker.sendSwitchSlide($scope.slideShowId, slideShowName, config.userSelectedSlideShowsPlayTimeInMinutes);
                }, function (err) {
                    throw err;
                });
            };

            $scope.goToPreviousSlide = messageBroker.sendMoveSlideLeft;
            $scope.goToNextSlide = messageBroker.sendMoveSlideRight;
            $scope.holdSlideShow = messageBroker.sendHoldSlideShow;
            $scope.resetSlideShow = messageBroker.sendResetSlideShow;

        }]);
}());
