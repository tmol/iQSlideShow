/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$state', '$timeout', 'Slides', '$location', 'DeviceMessageBroker', 'LocalStorage', 'Path', 'Timers', '$modal', '$window', 'HealthReporter', 'ServerMessageBroker',
        function ($scope, $state, $timeout, Slides, $location, DeviceMessageBroker, LocalStorage, Path, Timers, $modal, $window, HealthReporter, ServerMessageBroker) {
            var messageBroker = new DeviceMessageBroker();
            var serverMessageBroker = new ServerMessageBroker();
            var timers = new Timers();
            var handleDeviceSetup = null;

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
                serverMessageBroker
                    .sendHiMessage($scope.deviceId)
                    .then(function (response) {
                        handleDeviceSetup(response.data);
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

            handleDeviceSetup = function (message) {
                timers.resetTimeouts();
                loadSlidesForDevice(message.device.deviceId);
                $scope.active = message.device.active;

                if (!$scope.active) {
                    activationDialog.close();
                    activationDialog.show();
                    return;
                }
                timers.registerTimeout('healthReport', function () {
                    HealthReporter.report({deviceId: $scope.deviceId});
                }, 60 * 1000);
                // leave this the last, there is a bug in IE:
                // Unable to get property 'focus' of undefined or null reference
                // at at $modalStack.close (http://localhost:3000/lib/angular-bootstrap/ui-bootstrap-tpls.js?version=0.1:2262:11)
                // TODO fix this
                activationDialog.close();
            };

            messageBroker.onMoveSlideRight(function () {
                $scope.$broadcast("moveSlideRight");
            });
            messageBroker.onMoveSlideLeft(function () {
                $scope.$broadcast("moveSlideLeft");
            });
            messageBroker.onSwitchSlide(function (message) {
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
            });

            messageBroker.onDeviceSetup(handleDeviceSetup);

            messageBroker.onHoldSlideShow(function () {
                $scope.slideIsOnHold = true;
                $scope.$broadcast("putPlayerOnHold");
                timers.registerTimeout('resetOnHold', function () {
                    $scope.slideIsOnHold = false;
                    $scope.$broadcast("resetOnHold");
                }, 60 * 1000);
            });
            messageBroker.onResetSlideShow(function () {
                timers.resetTimeouts();
                $scope.slideIsOnHold = false;
                $scope.$broadcast("resetOnHold");
                sendHiToServer(); //this should revert the device state;
            });
            messageBroker.onInactiveRegisteredDeviceSaidHi(function () {
                activationDialog.show();
            });
            messageBroker.onReload(function () {
                $window.location.reload(true);
            });

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
                messageBroker.unSubscribe();
            });

            var startSlideshow = function () {
                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    LocalStorage.setDeviceId($scope.deviceId);
                }

                messageBroker.deviceId = $scope.deviceId;
                messageBroker.subscribe(function () {
                    sendHiToServer();
                });

                activationDialog.show();
            };
            startSlideshow();
        }]);
}());
