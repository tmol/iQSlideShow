/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function() {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'Slideshows', 'DeviceMessageBroker', 'Admin', 'Timers',
        function($scope, $stateParams, Slides, Slideshows, DeviceMessageBroker, Admin, Timers) {

            $scope.playerContext = {};

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

            $scope.setSlideShow = function() {
                Admin.getConfig(function(config) {
                    var slideShowName = _.filter($scope.slideshows, {
                        _id: $scope.slideShowId
                    })[0].name;
                    messageBroker.sendSwitchSlide($scope.slideShowId, slideShowName, config.userSelectedSlideShowsPlayTimeInMinutes);
                }, function(err) {
                    throw err;
                });
            };
            messageBroker.sendHoldSlideShow();
            var timers = new Timers();

            timers.registerInterval("presenceTimeOut", function() {
                messageBroker.sendPresence();
            }, 10000);

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
            Slideshows.filter({
                pageSize: 1000
            }, function(result) {
                //$scope.slideshows = result;
                $scope.numberOfSlidehsows = result.length;
            });
            $scope.selectSlideShow = function (slideShow) {
                $scope.previewSlideshowId = slideShow._id;
                $scope.playerContext.playerScope.switchSlideShow(slideShow._id);
                messageBroker.sendSwitchSlide(slideShow._id, slideShow.name);
            }
            $scope.$on("slideShowClicked", function(event, position) {
                messageBroker.sendSlideShowClicked(position);
            })
            $scope.$on("slidesLoaded", function(event, slides, slideShowId) {
                if (event.targetScope != $scope.playerContext.playerScope) {
                    return;
                }
                $scope.playerContext.playerScope.$broadcast("goToSlideNumber", 0);
                $scope.numberOfSlides = slides.length;
            });
            $scope.$on("currentSlideChanged", function(event, slideIndex, slideShowId, slideShowName) {
                if (slideShowId != $scope.previewSlideshowId) {
                    return;
                }
                $scope.title = slideShowName;
                $scope.currentPreviewSlideIndex = slideIndex + 1;
                messageBroker.sendGotoSlideNumber(slideIndex);
            });
            $scope.$on("slideShowLoaded", function(event, slideShow) {
                if (slideShow._id != $scope.previewSlideshowId) {
                    return;
                }
                $scope.title = slideShow.name;
                $scope.publishedOnDate = new Date(slideShow.publishedOnDate);
                $scope.author = slideShow.user ? slideShow.user.displayName:"";
            })
            $scope.$on("$destroy", function() {
                $scope.playerContext = null;
                timers.reset();
            });
        }
    ]);
}());
