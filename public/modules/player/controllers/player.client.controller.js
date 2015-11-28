/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$state', '$timeout', 'Slides', '$location', 'DeviceMessageBroker', 'LocalStorage', 'Path', 'Timers', '$modal', '$window', 'HealthReporter', 'ServerMessageBroker', 'Audit',
        function ($scope, $state, $timeout, Slides, $location, DeviceMessageBroker, LocalStorage, Path, Timers, $modal, $window, HealthReporter, ServerMessageBroker, Audit) {
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

            var audit = function (action, context) {
                var audit = new Audit({
                    action: action,
                    slideShowId: $scope.slideShowId,
                    deviceId: $scope.deviceId,
                    context: context
                });

                // Redirect after save
                audit.$save(function (response) {
                }, function (errorResponse) {
                    console.error('Error during auditing action: ' + action  + ': ' + errorResponse.data.message);
                });
            };

            var setupSlides = function () {
                $scope.slides.forEach(function (slide, index) {
                    slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                    slide.content.css = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css';
                    slide.content.js = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.js';
                    slide.content.resolution = slide.resolution;
                    slide.content.zoomPercent = slide.zoomPercent;
                    slide.index = index;
                });
            };
            var updateSildes = function (callback) {
                Slides.get({slideId : $scope.slideShowId}, function (result) {
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
                $scope.slideShowId = slideShowIdToPlay;
                activationDialog.close();
                updateSildes();
            };

            var loadSlidesForDevice = function (deviceId) {
                Slides.getSlidesForDevice({deviceId : deviceId}, function (result) {
                    $scope.slides = result;
                    setupSlides();
                });
            };
            var reportHealth = function () {
                HealthReporter.report({deviceId: $scope.deviceId});
            };

            timers.registerInterval('healthReport', function () {
                reportHealth();
            }, 60 * 1000);

            handleDeviceSetup = function (message) {
                timers.resetTimeouts();
                loadSlidesForDevice(message.device.deviceId);
                $scope.active = message.device.active;

                if (!$scope.active) {
                    activationDialog.close();
                    activationDialog.show();
                    return;
                }
                reportHealth();
                // leave this the last, there is a bug in IE:
                // Unable to get property 'focus' of undefined or null reference
                // at at $modalStack.close (http://localhost:3000/lib/angular-bootstrap/ui-bootstrap-tpls.js?version=0.1:2262:11)
                // TODO fix this
                activationDialog.close();
            };

            messageBroker.onMoveSlideRight(function () {
                $scope.$broadcast("moveSlideRight");
                audit('moveToRight');
            });
            messageBroker.onMoveSlideLeft(function () {
                $scope.$broadcast("moveSlideLeft");
                audit('moveToLeft');
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
                audit('switchSlideShow', {newSlideShowId: content.slideShowIdToPlay, newSlideShowName: content.slideShowName});

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
                audit('holdSlideShow');
            });
            messageBroker.onResetSlideShow(function () {
                timers.resetTimeouts();
                $scope.slideIsOnHold = false;
                $scope.$broadcast("resetOnHold");
                sendHiToServer(); //this should revert the device state;
                audit('resetSlideShow');
            });
            messageBroker.onInactiveRegisteredDeviceSaidHi(function () {
                activationDialog.show();
            });
            messageBroker.onReload(function () {
                $window.location.reload(true);
                audit('reload');
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
                timers.reset();
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
