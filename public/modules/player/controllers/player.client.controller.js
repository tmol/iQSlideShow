/*jslint nomen: true, vars: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$stateParams', '$state', '$timeout', 'Slides', 'CssInjector', '$interval', '$location', 'MessagingEngineFactory', 'LocalStorage', 'Path', 'Admin',
        function ($scope, $stateParams, $state, $timeout, Slides, CssInjector, $interval, $location, MessagingEngineFactory, LocalStorage, Path, Admin) {
            if ($scope.initialised) {
                return;
            }
            $scope.initialised = true;
            var messagingEngine = MessagingEngineFactory.getEngine();
            messagingEngine.subscribe();
            $scope.slideName = $stateParams.slideName;
            $scope.qrConfig = {
                slideUrl: $location.$$absUrl,
                size: 100,
                correctionLevel: '',
                typeNumber: 0,
                inputMode: '',
                image: true
            };

            var slideNumber = -1;

            $scope.slides = [];
            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(true);
            }

            $scope.lastTimeout = null;

            var timeoutCollection = {};

            var registerTimeout = function (key, func, delay) {
                $timeout.cancel(timeoutCollection[key]);
                timeoutCollection[key] = $timeout(func, delay);
            };

            var unRegisterTimeout = function (key) {
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

                $scope.animationType = slide.animationType;
                $scope.zoomPercent = slide.zoomPercent || 100;
                slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';

                CssInjector.inject($scope, 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css');

                $state.go("player.slide", {
                    slide : slide.content
                });

                return slide;
            };

            $scope.slideIsOnHold = false;
            var loadNextSlide = function () {

                slideNumber += 1;
                if (slideNumber < 0 || slideNumber >= $scope.slides.length) {
                    slideNumber = 0;
                }

                var advanceSlide = function (delay) {
                    if (!$scope.slideIsOnHold) {
                        registerTimeout('loadNextSlide', loadNextSlide, delay);
                    }
                };

                var slide = loadSlide(slideNumber);
                if (!slide) {
                    advanceSlide(1000);
                    return;
                }

                if (slide.durationInSeconds) {
                    advanceSlide(slide.durationInSeconds * 1000);
                }
            };


            var slideShow = function () {
                registerTimeout('loadNextSlide', loadNextSlide, 1);
            };

            $scope.delayedRequest = null;

            var switchSlideShow = function (deviceSetupMessage) {
                resetTimeouts();
                $interval.cancel($scope.updateSlidesHandle);

                //If the state is changed to quick, errors can occur.
                $timeout(function () {
                    $scope.slides = [];
                    $state.go("player", { slideName : deviceSetupMessage.content.slideShowIdToPlay, deviceId : $scope.deviceId, deviceSetupMessage : deviceSetupMessage}, {reload : true});
                }, 1000);
            };

            var updateSildes = function (callback) {

                Slides.get({slideId : $stateParams.slideName}, function (result) {
                    $scope.slides = result.slides;
                    if (callback) {
                        callback(result);
                    }
                });
            };

            var enterInactiveState = function () {
                $scope.slideActivationQr = {
                    slideUrl: $state.href("editDevice", {
                        deviceId : $scope.deviceId
                    }, { absolute : true }),
                    size: 100,
                    correctionLevel: '',
                    typeNumber: 0,
                    inputMode: '',
                    image: true
                };
            };

            var deviceInit = function () {
                var config = Admin.get(function (value) {
                    if (config !== null) {
                        $stateParams.slideName = value.defaultSlideShowId;
                        updateSildes(slideShow);
                    }
                }, function (httpResponse) {
                    // todo handle error
                });

                enterInactiveState();
                messagingEngine.publish('hi', $scope.deviceId);
            };

            var start = function () {
                if ('true' === $stateParams.preview) {
                    updateSildes(slideShow);
                    return;
                }

                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    LocalStorage.setDeviceId($scope.deviceId);
                }
                if ($stateParams.deviceSetupMessage) {
                    if (!$stateParams.deviceSetupMessage.device.active) {
                        enterInactiveState();
                    }
                    $stateParams.slideName = $stateParams.deviceSetupMessage.content.slideShowIdToPlay;
                    updateSildes(slideShow);
                    return;
                }

                deviceInit();
            };

            $scope.updateSlidesHandle = null;

            var moveSlideRight = function () {
                unRegisterTimeout('loadNextSlide');
                loadNextSlide();
            };

            var moveSlideLeft = function () {
                unRegisterTimeout('loadNextSlide');

                slideNumber -= 2;
                if (slideNumber < -1) {
                    slideNumber = $scope.slides.length - 2;
                }

                loadNextSlide();
            };

            var resetOnHold = function () {
                $scope.slideIsOnHold = false;
                loadNextSlide();
            };

            var messageHandler = {
                moveSlideRight : moveSlideRight,
                moveSlideLeft : moveSlideLeft,
                deviceSetup : function (message) {
                    var content = message.content;
                    if (!content.slideShowIdToPlay) {
                        return;
                    }

                    switchSlideShow(message);

                    // todo: manage this with the server side message (ask TB)
                    var duration = content.minutesToPlayBeforeGoingBackToDefaultSlideShow;
                    if (duration) {
                        registerTimeout("revertToOriginalSlideShow", function () {
                            switchSlideShow($scope.slideName);
                        }, duration * 60 * 1000);
                    }
                },
                holdSlideShow : function () {
                    $scope.slideIsOnHold = true;
                    registerTimeout('resetOnHold', function () {
                        resetOnHold();
                    }, 60 * 1000);
                },
                resetSlideShow : function () {
                    slideNumber = -1;
                    resetOnHold();
                    loadNextSlide();
                },
                inactiveRegisteredDeviceSaidHi : function (message) {
                    showActivateDialog();
                }
            };

            $scope.$on(messagingEngine.messageEvent, function (event, payload) {
                var message = payload.message;
                if (message.deviceId !== $scope.deviceId) {
                    return;
                }
                if (messageHandler[message.action]) {
                    messageHandler[message.action](message);
                }
            });

            $scope.$on("rightArrowPressed", function () {
                moveSlideRight();
            });

            $scope.$on("leftArrowPressed", function () {
                moveSlideLeft();
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

            start();
        }]);
}());
