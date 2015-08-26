/*jslint nomen: true, vars: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$stateParams', '$state', '$timeout', 'Slides', 'CssInjector', '$interval', '$location', 'PubNub',
        function ($scope, $stateParams, $state, $timeout, Slides, CssInjector, $interval, $location, PubNub) {
            if ($scope.initialised) {
                return;
            }
            $scope.initialised = true;
            $scope.deviceId = $stateParams.deviceId || PUBNUB.unique();

            PubNub.init({
                publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
                subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
                uuid : $scope.deviceId
            });

            //jQuery("#app-header").hide();
            $scope.slideName = $stateParams.slideName;
            $scope.qrConfig = {
                slideUrl: $location.$$absUrl,
                size: 100,
                correctionLevel: '',
                typeNumber: 0,
                inputMode: '',
                image: true
            };

            var timeoutCollection = {};

            var registerTimeout = function (key, func, delay) {
                $timeout.cancel(timeoutCollection[key]);
                timeoutCollection[key] = $timeout(func, delay);
            };

            var unRegisterTimeout = function (key, func, delay) {
                $timeout.cancel(timeoutCollection[key]);
                delete timeoutCollection[key];
            };

            var resetTimeouts = function () {
                var prop;
                for (prop in timeoutCollection) {
                    if (timeoutCollection.hasOwnProperty(prop)) {
                        $timeout.cancel(timeoutCollection[prop]);
                    }
                }
                timeoutCollection = {};
            };

            var slideNumber = -1;

            $scope.slides = [];
            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(true);
            }

            $scope.lastTimeout = null;

            var loadSlide = function (slideIndex) {
                if (slideIndex < 0 || slideIndex >= $scope.slides.length) {
                    slideIndex = 0;
                }

                var slide = $scope.slides[slideIndex];
                if (!slide) {
                    return null;
                }

                $scope.qrConfig.slideUrl = $state.href("deviceInteraction", {
                    deviceId : $scope.deviceId,
                    slideshowId : $stateParams.slideName,
                    slideNumber : slideNumber
                }, {absolute : true});

                if (!slide.content) {
                    return null;
                }

                var duration = slide.durationInSeconds;
                $scope.animationType = slide.animationType;
                $scope.zoomPercent = slide.zoomPercent || 100;
                slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';

                CssInjector.inject($scope, 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css');



                $state.go("player.slide", {
                    slide : slide.content
                });

                return slide;
            };

            var loadNextSlide = function () {
                slideNumber += 1;
                if (slideNumber < 0 || slideNumber >= $scope.slides.length) {
                    slideNumber = 0;
                }

                var slide = loadSlide(slideNumber);
                if (!slide) {
                    registerTimeout('loadNextSlide', loadNextSlide, 1000);
                    return;
                }

                if (slide.durationInSeconds) {
                    registerTimeout('loadNextSlide', loadNextSlide, slide.durationInSeconds * 1000);
                }
            };


            var slideShow = function () {
                registerTimeout('loadNextSlide', loadNextSlide, 1);
            };

            var theChannel = 'iQSlideShow';

            PubNub.ngSubscribe({ channel: theChannel });

            $scope.delayedRequest = null;

            var switchSlideShow = function (slideShowId) {
                resetTimeouts();
                $interval.cancel($scope.updateSlidesHandle);

                //If the state is changed to quick, errors can occur.
                $timeout(function () {
                    $scope.slides = [];
                    $state.go("player", { slideName : slideShowId, deviceId : $scope.deviceId}, {reload : true});
                }, 1000);
            };
            



            var updateSildes = function (callback) {

                Slides.get({slideId : $stateParams.slideName}, function (result) {
                    $scope.slides = result.slides;
                    if (callback) {
                        callback(result);
                    }
                });

                if ('true' !== $stateParams.preview) {
                    PubNub.ngPublish({
                        channel: theChannel,
                        message: {
                            action : 'presence',
                            id : $scope.deviceId,
                            slideShowId : $scope.slideName
                        }
                    });
                }
            };

            $scope.updateSlidesHandle = null;

            var onRightArrowPressed = function () {
                unRegisterTimeout('loadNextSlide');
                loadNextSlide();
            };

            var onLeftArrowPressed = function () {
                unRegisterTimeout('loadNextSlide');

                slideNumber -= 2;
                if (slideNumber < -1) {
                    slideNumber = $scope.slides.length - 2;
                }

                loadNextSlide();
            };

            var onPubNubMessage = function (message) {
                var pub = PubNub;
                var content = message.content;
                // payload contains message, channel, env...
                if (!(message.action === "deviceSetup"
                    && message.deviceId === $scope.deviceId
                    && content.slideShowIdToPlay)) {
                    return;
                }

                switchSlideShow(content.slideShowIdToPlay);

                var duration = content.minutesToPlayBeforeGoingBackToDefaultSlideShow;
                if (duration) {
                    registerTimeout("revertToOriginalSlideShow", function () {
                        switchSlideShow($scope.slideName);
                    }, duration * 60 * 1000);
                }
            }

            $scope.$on(PubNub.ngMsgEv(theChannel), function (event, payload) {
                onPubNubMessage(payload.message);
            });

            $scope.$on("rightArrowPressed", function () {
                onRightArrowPressed();
            });

            $scope.$on("leftArrowPressed", function () {
                onLeftArrowPressed();
            });

            $scope.$on("$destroy", function () {
                resetTimeouts();
                $interval.cancel($scope.updateSlidesHandle);
                if ($scope.setPlayerMode) {
                    $scope.setPlayerMode(false);
                }
            });

            if ($stateParams.slideNumber) {
                updateSildes(function () {
                    loadSlide($stateParams.slideNumber);
                });
                return;
            }

            $scope.updateSlidesHandle = $interval(function () {
                updateSildes();
            }, 10 * 1000);

            updateSildes(slideShow);
        }]);
}());
