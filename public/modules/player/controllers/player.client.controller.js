/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$state', '$timeout', 'Slides', '$location', 'DeviceMessageBroker',
                                                             'LocalStorage', 'Path', 'Timers', '$modal', '$window', 'HealthReporter', 'ServerMessageBroker', 'Audit', '$q', '$stateParams',
        function ($scope, $state, $timeout, Slides, $location, DeviceMessageBroker,
                   LocalStorage, Path, Timers, $modal, $window, HealthReporter, ServerMessageBroker, Audit, $q, $stateParams) {
            var messageBroker;
            var serverMessageBroker;

            $scope.isPreview = function () {
                return $scope.usePreview || $scope.$parent.usePreview || $state.current.name === "preview";
            };

            $scope.previewSlideId = $stateParams.slideName;

            if (!$scope.isPreview()) {
                messageBroker = new DeviceMessageBroker();
                serverMessageBroker = new ServerMessageBroker();
            } else {
                $scope.active = true;
            }

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

            var auditAction = function (action, context) {
                var audit = new Audit({
                    action: action,
                    slideShowId: $scope.slideShowId,
                    deviceId: $scope.deviceId,
                    context: context
                });

                // Redirect after save
                audit.$save(function (response) {
                    return;
                }, function (errorResponse) {
                    console.error('Error during auditing action: ' + action  + ': ' + errorResponse.data.message);
                });
            };

            var setupSlides = function (slides) {

                $scope.slides = slides;
                $scope.slides.forEach(function (slide, index) {
                    slide.index = index;
                });

                var promisses = [];

                slides.forEach(function (slide, index) {
                    slide.setupFinishedPromise = $q.defer();
                    promisses.push(slide.setupFinishedPromise.promise);
                });

                $q.all(promisses).then(function () {
                    var slides = [];
                    var slideIndex = 0;
                    $scope.slides.forEach(function (slide) {
                        if (!slide.expandedSlides) {
                            slides.push(slide);
                        } else {
                            slide.expandedSlides.forEach(function (expandedSlide) {
                                expandedSlide.index = slideIndex;
                                slideIndex = slideIndex + 1;
                                slides.push(expandedSlide);
                            });
                        }
                    });
                    $scope.slides = slides;
                });
            };

            var updateSildes = function (callback) {
                Slides.get({slideId : $scope.slideShowId}, function (result) {
                    setupSlides(result.slides);
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
                updateSildes(function () {
                    if ($scope.isPreview()) {
                        $timeout(function() {
                            $scope.$broadcast("goToSlideNumber", 0);
                        });
                    }
                });
            };

            var loadSlidesForDevice = function (deviceId) {
                Slides.getSlidesForDevice({deviceId : deviceId}, function (result) {
                    setupSlides(result);
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

            if (messageBroker) {

                messageBroker.onMoveSlideRight(function () {
                    $scope.$broadcast("moveSlideRight");
                    auditAction('moveToRight');
                });
                messageBroker.onMoveSlideLeft(function () {
                    $scope.$broadcast("moveSlideLeft");
                    auditAction('moveToLeft');
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
                    auditAction('switchSlideShow', {newSlideShowId: content.slideShowIdToPlay, newSlideShowName: content.slideShowName});

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
                    auditAction('holdSlideShow');
                });
                messageBroker.onResetSlideShow(function () {
                    timers.resetTimeouts();
                    $scope.slideIsOnHold = false;
                    $scope.$broadcast("resetOnHold");
                    sendHiToServer(); //this should revert the device state;
                    auditAction('resetSlideShow');
                });
                messageBroker.onInactiveRegisteredDeviceSaidHi(function () {
                    activationDialog.show();
                });
                messageBroker.onReload(function () {
                    $window.location.reload(true);
                    auditAction('reload');
                });
            }


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
                if (messageBroker) {
                    messageBroker.unSubscribe();
                }
            });

            var startSlideshow = function () {
                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    if (!$scope.isPreview()) {
                        LocalStorage.setDeviceId($scope.deviceId);
                    }
                }
                if (!$scope.isPreview()) {
                    messageBroker.deviceId = $scope.deviceId;
                    messageBroker.subscribe(function () {
                        sendHiToServer();
                    });
                    activationDialog.show();
                } else {
                    if ($scope.previewSlideId) {
                        switchSlideShow($scope.previewSlideId);
                    }
                }
            };
            startSlideshow();
            $scope.initPreview = function (previewSlideId) {
                $scope.usePreview = true;
                $scope.previewSlideId = previewSlideId;
                startSlideshow();
            };
        }]);
}());
