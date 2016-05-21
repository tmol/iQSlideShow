/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function() {
    'use strict';
    angular.module('player').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'DeviceInteractionService', 'DeviceMessageBroker', 'Timers',
        function($scope, $stateParams, Slides, DeviceInteractionService, DeviceMessageBroker, Timers) {

            $scope.playerContext = {};
            var slideShowSelected = false;
            var i = document.body;

            // go full-screen: POC - will be removed after tests
            if (i.requestFullscreen) {
                i.requestFullscreen();
            } else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen();
            } else if (i.mozRequestFullScreen) {
                i.mozRequestFullScreen();
            } else if (i.msRequestFullscreen) {
                i.msRequestFullscreen();
            }

            $scope.deviceId = $stateParams.deviceId;
            $scope.previewSlideshowId = $stateParams.slideShowId;
            var messageBroker = new DeviceMessageBroker($scope.deviceId);

            messageBroker.sendHoldSlideShow();
            var timers = new Timers();

            timers.registerInterval("presenceTimeOut", function() {
                messageBroker.sendPresence();
            }, 30000);

            $scope.moveSlideLeft = function() {
                $scope.playerContext.playerScope.$broadcast("moveSlideLeft");
            };
            $scope.moveSlideRight = function() {
                $scope.playerContext.playerScope.$broadcast("moveSlideRight");
            };
            $scope.togglePlay = function() {
                $scope.playSlideShow = !$scope.playSlideShow;
                var messageToBroadcast = $scope.playSlideShow ? 'resetOnHold' : 'putPlayerOnHold';
                $scope.playerContext.playerScope.$broadcast(messageToBroadcast, $scope.viewPlayerId);
            };
            $scope.numberOfSlidehsows = 0;
            $scope.nameFilter = "";
            var applyFilter = function () {
                $scope.$emit("ShowLoaderIndicator");
                DeviceInteractionService.getSlideShowsByFilter({
                    pageSize: 1000,
                    namesAndTagsFilter: $scope.nameFilter
                }, function(result) {
                    $scope.$emit("HideLoaderIndicator");
                    $scope.slideshows = result.data;
                    $scope.numberOfSlidehsows = result.data.length;
                });
            };
            applyFilter();

            $scope.selectSlideShow = function (slideShow) {
                $scope.playSlideShow = false;
                slideShowSelected = true;
                $scope.previewSlideshowId = slideShow._id;
                $scope.playerContext.playerScope.switchSlideShow(slideShow._id, function () {
                    slideShow.loadedWithError = false;
                }, function () {
                    slideShow.loadedWithError = true;
                });
                messageBroker.sendSwitchSlide(slideShow._id, slideShow.name);
            }
            $scope.$on("slideShowClicked", function(event, position) {
                messageBroker.sendSlideShowClicked(position);
            })
            $scope.$on("slidesLoaded", function(event, slides, slideShowId) {
                if (event.targetScope != $scope.playerContext.playerScope) {
                    return;
                }
                var slideNumber =parseInt($stateParams.slideNumber)-1;
                if (slideShowSelected)
                {
                    slideNumber = 0;
                }
                $scope.playerContext.playerScope.$broadcast("goToSlideNumber", slideNumber);
                $scope.numberOfSlides = slides.length;
            });
            $scope.$on("currentSlideChanged", function(event, slideIndex, slideShowId, slideInfo) {
                if (event.targetScope.$parent != $scope.playerContext.playerScope) {
                    return;
                }
                $scope.title = slideInfo.slideShowName;
                $scope.publishedOnDate = slideInfo.publishedOnDate;
                $scope.author = slideInfo.author;
                $scope.currentPreviewSlideIndex = slideIndex + 1;
                messageBroker.sendGotoSlideNumber(slideIndex);
            });
            $scope.$on("FilterSpecified", function (event, filter) {
                $scope.nameFilter = filter;
                applyFilter();
            });
            $scope.$on("$destroy", function() {
                $scope.playerContext = null;
                timers.reset();
            });
        }
    ]);
}());
