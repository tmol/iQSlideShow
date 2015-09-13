/*jslint nomen: true, vars: true, unparam: true, todo: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$stateParams', '$state', '$timeout', 'Slides', 'CssInjector', '$interval', '$location', 'MessagingEngineFactory', 'LocalStorage', 'Path', 'Admin', 'Timers', '$modal',
        function ($scope, $stateParams, $state, $timeout, Slides, CssInjector, $interval, $location, MessagingEngineFactory, LocalStorage, Path, Admin, Timers, $modal) {
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

            var loadSlide = function (slideIndex) {

                var slide = $scope.slides[slideIndex];
                if (!slide) {
                    return null;
                }

                $scope.qrConfig.slideUrl = $state.href("deviceInteraction", {
                    deviceId : $scope.deviceId,
                    slideshowId : $scope.slideName,
                    slideNumber : slideNumber
                }, {absolute : true});

                if (!slide.content) {
                    return null;
                }

                slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                CssInjector.inject($scope, 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css');
                $scope.currentIndex = slideIndex;

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
                        Timers.registerTimeout('loadNextSlide', loadNextSlide, delay);
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
                slideNumber = -1;
                Timers.registerTimeout('loadNextSlide', loadNextSlide, 1);
            };

            var updateSildes = function (callback) {
                Slides.get({slideId : $scope.slideName}, function (result) {
                    $scope.slides = result.slides;
                    if (callback) {
                        callback(result);
                    }
                });
            };

            var switchSlideShow = function (slideShowIdToPlay) {
                Timers.resetTimeouts();
                $interval.cancel($scope.updateSlidesHandle);
                $scope.slideName = slideShowIdToPlay;
                updateSildes(slideShow);
            };

            var deviceInit = function () {
                var config = Admin.get(function (value) {
                    if (config !== null) {
                        $scope.slideName = value.defaultSlideShowId;
                        updateSildes(slideShow);
                    }
                }, function (httpResponse) {
                    // TODO: handle error
                    return;
                });
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

                deviceInit();
            };

            $scope.updateSlidesHandle = null;

            var moveSlideRight = function () {
                Timers.unRegisterTimeout('loadNextSlide');
                loadNextSlide();
            };

            var moveSlideLeft = function () {
                Timers.unRegisterTimeout('loadNextSlide');

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
            var showActivateDialog = function () {
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
                $scope.modalInstance = $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('waitingForActivation'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    scope: $scope
                });
            };
            var messageHandler = {
                moveSlideRight : moveSlideRight,
                moveSlideLeft : moveSlideLeft,
                switchSlide : function (message) {
                    var content = message.content;
                    if (!content.slideShowIdToPlay) {
                        return;
                    }

                    switchSlideShow(content.slideShowIdToPlay);

                    // todo: manage this with the server side message (ask TB)
                    var duration = content.minutesToPlayBeforeGoingBackToDefaultSlideShow;
                    if (duration) {
                        Timers.registerTimeout("revertToOriginalSlideShow", function () {
                            switchSlideShow($scope.slideName);
                        }, duration * 60 * 1000);
                    }
                },
                deviceSetup : function (message) {
                    var content = message.device;
                    if (!content.active) {
                        showActivateDialog();
                        return;
                    }
                    if (!content.slideShowIdToPlay) {
                        return;
                    }
                    switchSlideShow(content.slideShowIdToPlay);
                },
                holdSlideShow : function () {
                    $scope.slideIsOnHold = true;
                    Timers.registerTimeout('resetOnHold', function () {
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
                Timers.resetTimeouts();
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

            start();
        }]);
}());
