/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$state', '$timeout', 'Slides', '$location', 'MessagingEngineFactory', 'LocalStorage', 'Path', 'Timers', '$modal', '$window',
        function ($scope, $state, $timeout, Slides, $location, MessagingEngineFactory, LocalStorage, Path, Timers, $modal, $window) {
            var messagingEngine = MessagingEngineFactory.getEngine();
            var messageHandler;

            var timers = new Timers();

            $scope.qrConfig = {
                slideUrl: $location.$$absUrl,
                size: 100,
                correctionLevel: '',
                typeNumber: 0,
                inputMode: '',
                image: true
            };

            $scope.slides = [];

            $scope.lastTimeout = null;
            $scope.slideIsOnHold = false;

            var sendHiToServer = function () {
                messagingEngine
                    .sendMessageToServer('hi', {deviceId: $scope.deviceId})
                    .then(function (response) {
                        messageHandler.deviceSetup(response.data);
                    });
            };

            var setupSlides = function () {
                $scope.slides.forEach(function (slide, index) {
                    slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                    slide.content.css = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css';
                    slide.index = index;
                });
            };
            var updateSildes = function (callback) {
                Slides.get({slideId : $scope.slideName}, function (result) {
                    $scope.slides = result.slides;
                    setupSlides();
                    if (callback) {
                        callback(result);
                    }
                });
            };

            var activationDialog = (function () {
                var modalInstance;

                var show = function () {
                    $scope.slideActivationQr = {
                        slideUrl: "/#!/devices/" + $scope.deviceId + "/edit",
                        size: 100,
                        correctionLevel: '',
                        typeNumber: 0,
                        inputMode: '',
                        image: true
                    };
                    modalInstance = $modal.open({
                        animation: false,
                        templateUrl: Path.getViewUrl('waitingForActivation'),
                        windowClass: 'waitingForActivationDialog',
                        backdrop: 'static',
                        scope: $scope
                    });
                };

                var close = function () {
                    if (modalInstance) {
                        modalInstance.close();
                    }
                };

                return {
                    show : show,
                    close: close
                };
            }());

            var switchSlideShow = function (slideShowIdToPlay) {
                timers.resetTimeouts();
                $scope.slideName = slideShowIdToPlay;
                activationDialog.close();
                updateSildes();
            };

            var loadSlidesForDevice = function (deviceId) {
                Slides.getSlidesForDevice({deviceId : deviceId}, function (result) {
                    $scope.slides = result;
                    setupSlides();
                });
            };

            messageHandler = {
                moveSlideRight : function () {
                    $scope.$broadcast("moveSlideRight");
                },
                moveSlideLeft : function () {
                    $scope.$broadcast("moveSlideLeft");
                },
                switchSlide : function (message) {
                    if (!$scope.active) {
                        return;
                    }
                    var content = message.content;
                    if (!content.slideShowIdToPlay) {
                        return;
                    }

                    $scope.$broadcast("resetOnHold");
                    switchSlideShow(content.slideShowIdToPlay);

                    var duration = content.minutesToPlayBeforeGoingBackToDefaultSlideShow;
                    if (duration) {
                        timers.registerTimeout("revertToOriginalSlideShow", function () {
                            sendHiToServer(); //this should revert the device state
                        }, duration * 60 * 1000);
                    }
                },
                deviceSetup : function (message) {
                    timers.resetTimeouts();
                    loadSlidesForDevice(message.device.deviceId);
                    $scope.active = message.device.active;

                    if (!$scope.active) {
                        activationDialog.close();
                        activationDialog.show();
                        return;
                    }
                    activationDialog.close();
                },
                holdSlideShow : function () {
                    $scope.slideIsOnHold = true;
                    $scope.$broadcast("putPlayerOnHold");
                    timers.registerTimeout('resetOnHold', function () {
                        $scope.slideIsOnHold = false;
                        $scope.$broadcast("resetOnHold");
                    }, 60 * 1000);
                },
                resetSlideShow : function () {
                    timers.resetTimeouts();
                    $scope.slideIsOnHold = false;
                    $scope.$broadcast("resetOnHold");
                    sendHiToServer(); //this should revert the device state;
                },
                inactiveRegisteredDeviceSaidHi : function (message) {
                    activationDialog.show();
                },
                reload: function () {
                    $window.location.reload(true);
                }
            };

            $scope.$on("rightArrowPressed", function () {
                $scope.$broadcast("moveSlideRight");
            });

            $scope.$on("leftArrowPressed", function () {
                $scope.$broadcast("moveSlideLeft");
            });

            $scope.$on("slideLoaded", function (event, slide) {
                $scope.qrConfig.slideUrl = "/#!/deviceInteraction/" + $scope.deviceId + "/" + slide.slideShowId + "/" + slide.slideNumber;
            });

            $scope.$on("$destroy", function () {
                timers.resetTimeouts();

                messagingEngine.unSubscribeFromDevice($scope.deviceId);
            });

            var startSlideshow = function () {
                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    LocalStorage.setDeviceId($scope.deviceId);
                }

                $scope.$on(messagingEngine.getDeviceChannelMessageEvent($scope.deviceId), function (event, payload) {
                    var message = payload.message;
                    if (messageHandler[message.action]) {
                        messageHandler[message.action](message);
                    }
                });

                activationDialog.show();

                messagingEngine.subscribeToDeviceChannel($scope.deviceId, function () {
                    sendHiToServer();
                });
            };
            startSlideshow();
        }]);
}());
