/*global angular, $*/
(function () {
    'use strict';
    angular.module('core').directive('ngSlideView', ['resolutions', '$rootScope', 'SlideSetup', 'resizeSenzor', '$timeout',
        function (resolutions, $rootScope, SlideSetup, resizeSenzor, $timeout) {
            var indicator = "<svg style='width:0px;height:0px;opacity:0.8;position: absolute;margin-left:0px;margin-top:0px;display:none;z-index:1000; transform: translate(-50%,-50%)'><circle cx='50%' cy='50%' r='46%' stroke='red' fill='red' fill-opacity='0.0' stroke-width='4%'></circle></svg>";


            var template = '<div class="slide-content-container" style="width:100%;height:100%;position:relative;"><div class="slideshow-placeholder" style="position:absolute;width:{{resolution.width}}px;height:{{resolution.height}}px;transform-origin: 0px 0px 0;left:50%;top:50%;" touch-start="onSlideClicked($event)" ng-show="slideReady">';
            template += "<div class='toBeScaled' style='position:absolute;display:inline-block;transform-origin: 0px 0px 0;left:50%;top:50%;'>";
            template += "<div ng-class=\"{'iqss-hidden':!slideLoaded}\" ng-include='templateUrl' onload='templateLoaded()' class='ng-slide-view'></div>";
            template += "<div ng-show='!slideLoaded' style='top: 50%; position: absolute; left: 50%;  transform: translate(-50%,-50%);z-index:100' >LOADING...</div>";
            template += "</div>";
            template += '</div>';
            template += '<div qr-device-interaction ng-if="!slideHasQrCode" qr-config="qrConfig" style="position: fixed;right: 10px;bottom: 10px;"></div>';
            template += '</div>';
            return {
                scope: {
                    qrConfig: '=',
                    slideWidth: "=",
                    slideHeight: "=",
                    referenceSlide: "&",
                    isPlaying: "=",
                    emitSlideLoadedEvent: "="
                },
                template: template,
                link: function (scope, element, attrs) {
                    var templateLoaded = false;
                    scope.loadedScripts = [];
                    scope.slideLoaded = false;
                    scope.indicatorVisible = false;
                    scope.indicatorSize = 0;
                    scope.slideReady = false;
                    scope.slideHasQrCode = false;
                    scope.slide = null;
                    var appliedScale = 1;
                    var getSizeMeasurementContainer = function () {
                        var container = $("#measurementContainer");
                        if (container.length) {
                            return container;
                        }
                        return $("body").append(measurementContainer);
                    }

                    var zoomContentToElement = function () {
                        var elementToScale = element.find(".toBeScaled");
                        var parent = elementToScale.parent();

                        if (elementToScale.width()==0 || elementToScale.height() == 0)  {
                            return;
                        }

                        var sx = parent[0].offsetWidth / elementToScale[0].offsetWidth;
                        var sy = parent[0].offsetHeight / elementToScale[0].offsetHeight;
                        var scale = Math.min(sx, sy);

                        elementToScale.css("transform", "scale(" + scale + ") translate(-50%, -50%)");
                    }

                    var scaleElementToResolution = function () {
                        if (scope.emitSlideLoadedEvent === true) {
                            scope.$emit("slideLoadedInSlideView");
                        }
                        if (!scope.slide) {
                            return;
                        }
                        scope.resolution = scope.slide.resolution || resolutions[0];
                        scope.indicatorSize = Math.max(scope.resolution.width, scope.resolution.height) * 10 / 100;

                        var sx = element.parent()[0].offsetWidth / scope.resolution.width;
                        var sy = element.parent()[0].offsetHeight / scope.resolution.height;
                        var appliedScale = Math.min(sx, sy);

                        element.find(".slideshow-placeholder").css("transform", "scale(" + appliedScale + ") translate(-50%, -50%)");
                        zoomContentToElement();
                        scope.slideReady = true;
                    };

                    var detectSlideQrCode = function () {
                        scope.slideHasQrCode = element.find('.ng-slide-view').find('qr-device-interaction, [qr-device-interaction]').length === 1;
                    };

                    var lastTimeout;
                    var update = function () {
                        window.clearTimeout(lastTimeout);

                        detectSlideQrCode();

                        if (scope.slideConfiguration && scope.slideConfiguration.onUpdate) {
                            scope.slideConfiguration.onUpdate(function () {
                                lastTimeout = window.setTimeout(scaleElementToResolution, 10);
                            }, element.find(".ng-slide-view").children().first());
                            return;
                        }

                        lastTimeout = window.setTimeout(scaleElementToResolution, 10);
                    };

                    var contentResizeSenzorDestroy = resizeSenzor(element.find(".toBeScaled")[0], update);
                    var parentResizeSenzorDestroy = resizeSenzor(element.find(".slide-content-container")[0], update);

                    scope.onSlideClicked = function (event) {
                        var pageX = 0;
                        var pageY = 0;
                        if (event.originalEvent.touches && event.originalEvent.touches.length > 0) {
                            pageX = event.originalEvent.touches[0].pageX;
                            pageY = event.originalEvent.touches[0].pageY;
                        } else {
                            pageX = event.originalEvent.pageX;
                            pageY = event.originalEvent.pageY;
                        }
                        var target = $(event.currentTarget);

                        var x = pageX - target.offset().left;
                        var y = pageY - target.offset().top;


                        var percentX = x * 100 / (scope.resolution.width * appliedScale);
                        var percentY = y * 100 / (scope.resolution.height * appliedScale);


                        $rootScope.$broadcast("slideShowClicked", {percentX : percentX, percentY : percentY});
                    };

                    scope.$watch("referenceSlide()", function (newValue, oldValue) {
                        if (!newValue) {
                            return;
                        }
                        scope.slide = newValue;
                        SlideSetup.setup(scope, element);
                    });
                    scope.$watch("slide.resolution", function (newValue, oldValue) {
                        if (!scope.isPlaying) {
                            update();
                        }
                    });

                    scope.$on("getSlideContentPart", function (event, contentPartName, callback) {
                        if (!scope.slide) {
                            return;
                        }
                        var content = scope.slide.content || {};
                        callback(content[contentPartName]);
                    });
                    scope.$on("getTemplatePath", function (event, callback) {
                        callback(scope.referencePath);
                    });

                    scope.$on("displayIndicator", function (event, position) {
                        window.setTimeout(function () {
                            var indicatorElement = $(indicator);
                            indicatorElement.css({
                                "margin-left" : ((scope.resolution.width * position.percentX) / 100) + "px",
                                "margin-top" : ((scope.resolution.height * position.percentY) / 100) + "px",
                                "display" : "block"
                            });
                            element.find('.slideshow-placeholder').append(indicatorElement);
                            indicatorElement.animate({width: scope.indicatorSize + "px", height: scope.indicatorSize + "px"}, 1000, "easeInOutElastic", function () {
                                window.setTimeout(function () {
                                    indicatorElement.animate({width: "0px", height: "0px"}, 3000, "easeInOutElastic", function () {
                                        indicatorElement.remove();
                                    });
                                }, 2000);

                            });
                        }, 10);
                    });

                    scope.$on("currentSlideChanged", function (event, currentSlideIndex) {
                        if (scope.slide.index !== currentSlideIndex) {
                            // This will hide the player QR code.
                            scope.slideHasQrCode = true;
                        } else {
                            detectSlideQrCode();
                        }
                    });

                    scope.$on("scriptLoaded", function (event, scriptUrl) {
                        scope.loadedScripts.push(scriptUrl);
                    });

                    scope.$on("scriptCached", function (event, scriptUrl) {
                        if (scope.loadedScripts.indexOf(scriptUrl) == -1) {
                            scope.loadedScripts.push(scriptUrl);
                        }
                    });

                    scope.$on("$destroy", function () {
                        contentResizeSenzorDestroy();
                        parentResizeSenzorDestroy();
                    });

                    scope.templateLoaded = function () {
                        if (!scope.slide) {
                            // no slide was specified, for exampel empty slideshow edit page
                            return;
                        }
                        templateLoaded = true;
                        scope.slideLoaded = true;
                        SlideSetup.loadScripts(scope, element).then(function () {
                            if (scope.slide.setupFinishedPromise) {
                                scope.slide.setupFinishedPromise.resolve();
                            }

                           $timeout(update,20);
                        });
                    };
                }
            };
        }
    ]);
}());
