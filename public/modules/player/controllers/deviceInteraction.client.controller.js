/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function() {
    'use strict';
    angular.module('player').controller('DeviceInteractionController', ['$scope', '$stateParams', 'Slides', 'DeviceInteractionService', 'DeviceMessageBroker', 'Timers',
        function($scope, $stateParams, Slides, DeviceInteractionService, DeviceMessageBroker, Timers) {

            $scope.playerContext = {};
            var slideShowSelected = false;
            var i = document.body;

            $scope.filterParameters = {
                pageSize: 20,
                fullyLoaded: false
            };

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
            $scope.nameFilter = "";

            var executeFilter = function (callback) {
                $scope.$emit("ShowLoaderIndicator");
                DeviceInteractionService.getSlideShowsByFilter({
                    pageSize: $scope.filterParameters.pageSize,
                    namesAndTagsFilter: $scope.slideShowFilter,
                    lastPageLastItemCreated: $scope.filterParameters.lastPageLastItemCreated
                }, function(result) {
                    $scope.$emit("HideLoaderIndicator");
                    callback(result);
                });
            };

            var applyFilterInternal = function () {
                delete $scope.filterParameters.lastPageLastItemCreated;
                delete $scope.filterParameters.fullyLoaded;
                
                executeFilter(function(result) {
                    if (result.data.length > 0) {
                        $scope.filterParameters.lastPageLastItemCreated = _.last(result.data).created;
                    }

                    if (result.data.length < $scope.filterParameters.pageSize) {
                        $scope.filterParameters.fullyLoaded = true;
                    }

                    $scope.slideshows = result.data;
                });
            }
            applyFilterInternal();

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

            $scope.applyFilter = function () {
                if ($scope.slideShowFilter) {
                    applyFilterInternal();
                }

                $scope.displayFilter = false;
            };

            $scope.enableFilter = function () {
                $scope.displayFilter = true;
            };

            $scope.getNextChunk = function () {
                if ($scope.filterParameters.fullyLoaded) {
                    return;
                }

                executeFilter(function(result) {
                    if (result.data.length > 0) {
                        $scope.filterParameters.lastPageLastItemCreated = _.last(result.data).created;
                    }

                    if (result.data.length < $scope.filterParameters.pageSize) {
                        $scope.filterParameters.fullyLoaded = true;
                    }

                    $scope.slideshows = _.concat($scope.slideshows, result.data);
                });
            };

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
                var slideShow = _.find($scope.slideshows, { _id: slideShowId });
                if (slideShow) {
                    slideShow.slides = slides;
                }
            });
            $scope.$on("currentSlideChanged", function(event, slideIndex, slideShowId, slideInfo) {
                if (event.targetScope.$parent != $scope.playerContext.playerScope) {
                    return;
                }
                $scope.title = slideInfo.slideShowName;
                $scope.publishedOnDate = slideInfo.publishedOnDate;
                $scope.author = slideInfo.author;
                $scope.detailsUrl = slideInfo.detailsUrl;
                $scope.currentPreviewSlideIndex = slideIndex + 1;
                messageBroker.sendGotoSlideNumber(slideIndex);
            });
            $scope.$on("$destroy", function() {
                $scope.playerContext = null;
                timers.reset();
            });
        }
    ]);
}());
