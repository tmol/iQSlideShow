/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$state', '$timeout', 'Slides', '$location', 'DeviceMessageBroker',
                                                             'LocalStorage', 'Path', 'Timers', '$uibModal', '$window', 'HealthReporter', 'ServerMessageBroker', 'Audit', '$q', '$stateParams',
        function ($scope, $state, $timeout, Slides, $location, DeviceMessageBroker,
                   LocalStorage, Path, Timers, $uibModal, $window, HealthReporter, ServerMessageBroker, Audit, $q, $stateParams) {
            var messageBroker;
            var serverMessageBroker;

            $scope.isPreview = function () {
                return $state.usePreview || $state.current.name === "preview";
            };

            if ($scope.isPreview()) {
                $scope.active = true;
            }
            $scope.showDraftSlides = false;

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

            var setupSlides = function (slides, slideShowId) {
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
                    if ($scope.usePreviewFirstSlide && slides && slides.length) {
                        $scope.numberOfSlides = $scope.numberOfSlides>slides.length?$scope.numberOfSlides:slides.length;
                        slides = [slides[0]];
                    }
                    $scope.slides = slides;
                    $scope.$emit("slidesLoaded", slides, slideShowId);
                });
                //$scope.$broadcast("goToSlideNumber", 0);
            };

            var updateSildes = function (callback) {
                Slides.get({slideId : $scope.slideShowId}, function (result) {

                    $scope.$emit("slideShowLoaded", result);
                    if (result.user) {
                        $scope.nameOfAuthor = result.user.displayName;
                    }
                    $scope.lastModified = result.modified;
                    $scope.title = result.name;
                    $scope.numberOfSlides = result.slides.length
                    if ($scope.usePreviewFirstSlide && result.slides && result.slides.length) {
                        result.slides = [result.slides[0]];
                    }
                    if ($scope.showDraftSlides) {
                        result.slides = result.draftSlides;
                    }
                    setupSlides(result.slides, $scope.slideShowId);
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
                    modalInstance = $uibModal.open({
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

            $scope.switchSlideShow = function (slideShowIdToPlay) {
                timers.resetTimeouts();
                $scope.slideShowId = slideShowIdToPlay;
                activationDialog.close();
                var displayFirstSlideForPreview = function () {
                    if ($scope.usePreview) {
                        $scope.$broadcast("goToSlideNumber", 0);
                    }
                };
                updateSildes(displayFirstSlideForPreview);
            };

            var loadSlidesForDevice = function (deviceId) {
                Slides.getSlidesForDevice({deviceId : deviceId}, function (result) {
                    if ($scope.usePreviewFirstSlide && result && result.length) {
                        result = [result[0]];
                    }
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
                $scope.active = message.active;

                if (!$scope.active) {
                    activationDialog.close();
                    activationDialog.show();
                    $scope.slides = [];
                    return;
                } else {
                    loadSlidesForDevice($scope.deviceId);
                }
                reportHealth();
                // leave this the last, there is a bug in IE:
                // Unable to get property 'focus' of undefined or null reference
                // at at $modalStack.close (http://localhost:3000/lib/angular-bootstrap/ui-bootstrap-tpls.js?version=0.1:2262:11)
                // TODO fix this
                activationDialog.close();
            };

            $scope.$on("rightArrowPressed", function () {
                $scope.$broadcast("moveSlideRight");
            });

            $scope.$on("leftArrowPressed", function () {
                $scope.$broadcast("moveSlideLeft");
            });

            $scope.$on("currentSlideChanged", function (event, currentIndex, slideShowId) {
                var url = $location.$$absUrl.split("/slideshow")[0];
                $scope.qrConfig.slideUrl = url + "/slideshow#!/deviceInteraction/" + $scope.deviceId + "/" + slideShowId + "/" + (currentIndex + 1);
            });

            $scope.$on("$destroy", function () {
                timers.reset();
                if (messageBroker) {
                    messageBroker.unSubscribe();
                }
            });

            var setupMessagining = function (deviceId) {
                var lastAnounceTime = Date.now();
                var onlinePollingTime = 60 * 10000;
                var deviceInteractionIsOnline = function () {
                    var timeDiff = Date.now() - lastAnounceTime;
                    var timeDiffInSec = timeDiff / 1000;
                    var timeDiffInMin = timeDiffInSec / 60;

                    return timeDiffInMin < 3;
                };
                var putSlideShowOnHold = function () {
                    $scope.slideIsOnHold = true;
                    $scope.$broadcast("putPlayerOnHold");

                    var resetOnHold = function () {
                        timers.registerTimeout('resetOnHold', function () {
                            if (deviceInteractionIsOnline()) {
                                resetOnHold();
                                return;
                            }
                            $scope.slideIsOnHold = false;
                            $scope.$broadcast("resetOnHold");
                        }, onlinePollingTime);
                    };
                    resetOnHold();


                    auditAction('holdSlideShow');
                };
                messageBroker = new DeviceMessageBroker(deviceId);
                serverMessageBroker = new ServerMessageBroker();
                messageBroker.onDeviceInteractionIsPresent(function () {
                    lastAnounceTime = Date.now();
                    putSlideShowOnHold();
                });
                messageBroker.onGotoSlideNumber(function (message) {
                    $scope.$broadcast("goToSlideNumber", message.content);
                    auditAction('goToSlideNumber');
                });
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

                    $scope.switchSlideShow(content.slideShowIdToPlay);
                    auditAction('switchSlideShow', {newSlideShowId: content.slideShowIdToPlay, newSlideShowName: content.slideShowName});

                    var duration = content.minutesToPlayBeforeGoingBackToDefaultSlideShow;
                    if (duration) {
                        timers.registerTimeout("revertToOriginalSlideShow", function () {
                            if (deviceInteractionIsOnline()) {
                                return;
                            }
                            sendHiToServer(); //this should revert the device state
                        }, duration * 60 * 1000);
                    }
                });
                messageBroker.onDeviceSetup(handleDeviceSetup);
                messageBroker.onHoldSlideShow(function () {
                    putSlideShowOnHold();
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
                messageBroker.onSlideShowClicked(function (message) {
                    if (!$scope.active) {
                        return;
                    }
                    $scope.$broadcast("displayIndicator", message.content);
                    $timeout(function () {
                        $scope.$broadcast("hideIndicator");
                    }, 2000);
                });
            };

            var startSlideshow = function () {

                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    LocalStorage.setDeviceId($scope.deviceId);
                }
                setupMessagining($scope.deviceId);
                messageBroker.deviceId = $scope.deviceId;
                messageBroker.subscribe(function () {
                    sendHiToServer();
                });
                activationDialog.show();

            };

            $scope.initPreviewFirstSlide = function (previewSlideId, context) {
                $scope.usePreviewFirstSlide = true;
                $scope.initPreview(previewSlideId, context);
            };

            $scope.initPreviewDraftSlides = function (previewSlideId, context) {
                $scope.showDraftSlides = true;
                $scope.initPreview(previewSlideId, context);
            };

            $scope.initPreview = function (previewSlideId, context) {
                $scope.usePreview = true;
                $scope.switchSlideShow(previewSlideId);
                if (context) {
                    context.playerScope = $scope;
                }
            };

            $scope.initDevicePreview = function (deviceId, context) {
                $scope.usePreview = true;
                loadSlidesForDevice(deviceId);
                if (context) {
                    context.playerScope = $scope;
                }
            };

            if ($state.current.name === "player") {
                startSlideshow();
            }
            if ($state.current.name === "preview") {
                $scope.switchSlideShow($stateParams.slideName);
            }
        }]);
}());
