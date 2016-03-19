/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'Slideshows', 'DeviceMessageBroker', 'Admin', 'Timers',
        function ($scope, $stateParams, Slides, Slideshows, DeviceMessageBroker, Admin, Timers) {
            $scope.deviceId = $stateParams.deviceId;
            $scope.previewSlideshowId = $stateParams.slideShowId;
            var messageBroker = new DeviceMessageBroker($scope.deviceId);

            $scope.setSlideShow = function () {
                Admin.getConfig(function (config) {
                    var slideShowName = _.filter($scope.slideshows, {_id: $scope.slideShowId})[0].name;
                    messageBroker.sendSwitchSlide($scope.slideShowId, slideShowName, config.userSelectedSlideShowsPlayTimeInMinutes);
                }, function (err) {
                    throw err;
                });
            };
            messageBroker.sendHoldSlideShow();
            var timers = new Timers();

            timers.registerInterval("presenceTimeOut", function () {
                messageBroker.sendPresence();
            }, 10000);

            $scope.moveSlideLeft = function () {
                $scope.$broadcast("moveSlideLeft");
                messageBroker.sendMoveSlideLeft();
            };
            $scope.moveSlideRight = function () {
                $scope.$broadcast("moveSlideRight");
                messageBroker.sendMoveSlideRight();
            };
            $scope.togglePlay = function () {
                $scope.playSlideShow = !$scope.playSlideShow;
                var messageToBroadcast = $scope.playSlideShow ? 'resetOnHold' : 'putPlayerOnHold';
                $scope.$broadcast(messageToBroadcast, $scope.viewPlayerId);
                if (!$scope.playSlideShow) {
                    messageBroker.sendHoldSlideShow();
                } else {
                    messageBroker.sendResetSlideShow();
                }
            };
            $scope.numberOfSlidehsows = 0;
            Slideshows.filter({
                pageSize: 1000
            }, function (result) {
                $scope.slideshows = result;
                $scope.numberOfSlidehsows = result.length;
            });
            $scope.$on("slideShowClicked", function (event, position) {
                messageBroker.sendSlideShowClicked(position);
            })
            $scope.$on("slidesLoaded", function (event, slides, slideShowId) {
                if (slideShowId!=$scope.previewSlideshowId) {
                    return;
                }
                $scope.numberOfSlides = slides.length;
            });
            $scope.$on("currentSlideChanged", function (event, slideIndex) {
                $scope.currentPreviewSlideIndex = slideIndex + 1;
            });
            $scope.$on("slideShowLoaded", function (event, slideShow) {
                $scope.title = slideShow.name;
                $scope.createdOn = new Date(slideShow.created);
                $scope.author = slideShow.user.displayName;
            })
            $scope.$on("$destroy", function () {
                timers.reset();
            });
        }]);
}());
