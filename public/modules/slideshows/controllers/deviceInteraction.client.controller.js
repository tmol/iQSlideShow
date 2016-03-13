/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'Slideshows', 'DeviceMessageBroker', 'Admin',
        function ($scope, $stateParams, Slides, Slideshows, DeviceMessageBroker, Admin) {
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
                    $scope.numberOfSlidehsows = slideshows.length;
                });

            $scope.$on("slidesLoaded", function (event, slides) {
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
        }]);
}());
