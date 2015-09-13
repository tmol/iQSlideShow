/*jslint nomen: true, vars: true, unparam: true, todo: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('PlayerController', ['$scope', '$stateParams', '$state', '$timeout', 'Slides', '$location', 'MessagingEngineFactory', 'LocalStorage', 'Path', 'Admin', 'Timers', '$modal',
        function ($scope, $stateParams, $state, $timeout, Slides, $location, MessagingEngineFactory, LocalStorage, Path, Admin, Timers, $modal) {
            var messagingEngine = MessagingEngineFactory.getEngine();
            messagingEngine.subscribe();
            $scope.slideName = $stateParams.slideName;
            var displaySlideNumber = $stateParams.slideNumber;

            $scope.qrConfig = {
                slideUrl: $location.$$absUrl,
                size: 100,
                correctionLevel: '',
                typeNumber: 0,
                inputMode: '',
                image: true
            };

            $scope.slides = [];
            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(true);
            }
            $scope.lastTimeout = null;
            $scope.slideIsOnHold = false;

            var updateSildes = function (callback) {
                var setupSlides = function () {
                    $scope.slides.forEach(function (slide, index) {
                        slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                        slide.content.css = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css';
                        slide.index = index;
                    });
                };

                Slides.get({slideId : $scope.slideName}, function (result) {
                    $scope.slides = result.slides;
                    setupSlides();
                    if (callback) {
                        callback(result);
                    }
                });
            };

            var switchSlideShow = function (slideShowIdToPlay) {
                Timers.resetTimeouts();
                $scope.slideName = slideShowIdToPlay;

                if (displaySlideNumber >= 0) {
                    updateSildes(function () {
                        $scope.$broadcast("goToSlideNumber", displaySlideNumber);
                    });
                    return;
                }

                updateSildes();
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
                moveSlideRight : function () {
                    $scope.$broadcast("moveSlideRight");
                },
                moveSlideLeft : function () {
                    $scope.$broadcast("moveSlideLeft");
                },
                switchSlide : function (message) {
                    var content = message.content;
                    if (!content.slideShowIdToPlay) {
                        return;
                    }

                    displaySlideNumber = -1;
                    $scope.$broadcast("resetOnHold");
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
                    $scope.$broadcast("putPlayerOnHold");
                    Timers.registerTimeout('resetOnHold', function () {
                        $scope.slideIsOnHold = false;
                        $scope.$broadcast("resetOnHold");
                    }, 60 * 1000);
                },
                resetSlideShow : function () {
                    displaySlideNumber = -1;
                    $scope.slideIsOnHold = false;
                    $scope.$broadcast("resetSlideShow");
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
                $scope.$broadcast("moveSlideRight");
            });

            $scope.$on("leftArrowPressed", function () {
                $scope.$broadcast("moveSlideLeft");
            });

            $scope.$on("slideLoaded", function (slide) {
                $scope.qrConfig.slideUrl = $state.href("deviceInteraction", {
                    deviceId : $scope.deviceId,
                    slideshowId : $scope.slideName,
                    slideNumber : slide.index
                }, {absolute : true});
            });

            $scope.$on("$destroy", function () {
                Timers.resetTimeouts();
                if ($scope.setPlayerMode) {
                    $scope.setPlayerMode(false);
                }
            });

            var startSlideshow = function () {
                if ('true' === $stateParams.preview) {
                    updateSildes();
                    return;
                }

                $scope.deviceId = LocalStorage.getDeviceId();
                if ($scope.deviceId === null) {
                    $scope.deviceId = PUBNUB.unique();
                    LocalStorage.setDeviceId($scope.deviceId);
                }

                var deviceInit = function () {
                    var config = Admin.get(function (value) {
                        if (config !== null) {
                            switchSlideShow(value.defaultSlideShowId);
                        }
                    }, function (httpResponse) {
                        // TODO: handle error
                        return;
                    });
                    messagingEngine.publish('hi', $scope.deviceId);
                };
                deviceInit();
            };
            startSlideshow();
        }]);
}());
