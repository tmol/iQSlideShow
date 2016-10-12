/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, alert*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayer', ['Timers', 'CssInjector', 'JsInjector',
        function (Timers, CssInjector, JsInjector) {
            var i = 0;

            var template = '';
            template += '<div ng-repeat="slide in slides() track by $index" ng-show="$index==currentIndex" ng-class="{loaded: slidesLoaded}"';
            template += '     class="{{slide.animationType}} slideShow" style="width:100%;height:100%;position:relative;display:block;overflow:hidden"';
            template += '     ng-slide-view is-playing="true" interaction-mode="interaction" reference-slide="slide" qr-config="qrConfig">';
            template += '</div>';

            return {
                scope: {
                    slides: '&',
                    qrConfig: '=',
                    ngPlayerOnHold: '&',
                    ngPlayerInteraction: '&',
                    ngPlayerIgnoreMessages: "&",
                    slideShowId: '='
                },
                transclude: true,
                template: template,
                link: function (scope, element, attrs) {
                    var slideNumber = -1;
                    var timers = new Timers();
                    var ignoreMessages = false;
                    if (scope.ngPlayerIgnoreMessages) {
                        ignoreMessages = scope.ngPlayerIgnoreMessages();
                    }
                    if (scope.ngPlayerInteraction) {
                        scope.interaction = scope.ngPlayerInteraction();
                    }
                    if (scope.ngPlayerOnHold) {
                        scope.onHold = scope.ngPlayerOnHold();
                    }

                    var emitCurrentSlideChanged = function (slide) {
                        var slideInfo = {
                            index: slide.index,
                            slideShowName : slide.slideShowName,
                            author : slide.author,
                            publishedOnDate : new Date(slide.publishedOnDate),
                            detailsUrl: slide.detailsUrl
                        }
                        scope.$emit("currentSlideChanged", scope.currentIndex, slide.slideShowId, slideInfo);
                        scope.$broadcast("currentSlideChanged", scope.currentIndex, slide.slideShowId, slideInfo);
                    };

                    var loadSlide = function (slideIndex) {

                        scope.currentIndex = slideNumber;
                        if (!scope.slides) {
                            return;
                        }
                        var slides = scope.slides();

                        var slide = slides[slideIndex];

                        if (!slide) {
                            return null;
                        }

                        return slide;
                    };
                    var loadNextSlide;
                    var advanceSlide = function (delay) {
                        timers.registerTimeout('loadNextSlide', loadNextSlide, delay);
                    };
                    loadNextSlide = function (forcedLoad) {
                        if (!scope.slides) {
                            return;
                        }

                        if (scope.onHold && !forcedLoad) {
                            return;
                        }

                        var slides = scope.slides();
                        slideNumber += 1;
                        if (slideNumber < 0 || slideNumber >= slides.length) {
                            slideNumber = 0;
                        }
                        scope.currentIndex = slideNumber;
                        var slide = loadSlide(slideNumber);
                        if (!slide) { //if there were no slide displayed, than advance to the next one
                            advanceSlide(1000);
                            return;
                        }
                        emitCurrentSlideChanged(slide);

                        slide.durationInSeconds = slide.durationInSeconds || 1;
                        advanceSlide(slide.durationInSeconds * 1000);
                    };

                    scope.$watch("slides", function () {
                        timers.resetTimeouts();
                        slideNumber = -1;
                        loadNextSlide();

                    });

                    var isIdSpecifiedAndNotEqualsWithGivenId = function (id) {
                        return scope.slideShowId && scope.slideShowId !== id;
                    };

                    if (!ignoreMessages) {
                        scope.$on("moveSlideRight", function (event, id) {
                            if (isIdSpecifiedAndNotEqualsWithGivenId(id)) {
                                return;
                            }

                            timers.unRegisterTimeout('loadNextSlide');
                            loadNextSlide(true);
                        });

                        scope.$on("moveSlideLeft", function (event, id) {
                            if (isIdSpecifiedAndNotEqualsWithGivenId(id)) {
                                return;
                            }

                            timers.unRegisterTimeout('loadNextSlide');

                            slideNumber -= 2;
                            if (slideNumber < -1) {
                                slideNumber = scope.slides.length - 2;
                            }

                            loadNextSlide(true);
                        });

                        scope.$on("resetOnHold", function (event, playerId) {
                            scope.onHold = false;
                            loadNextSlide();
                        });

                        scope.$on("putPlayerOnHold", function (event, playerId) {
                            scope.onHold = true;
                        });

                        scope.$on("resetSlideShow", function () {
                            scope.onHold = false;
                            timers.resetTimeouts();
                            loadNextSlide();
                        });

                        scope.$on("goToSlideNumber", function (e, slideIndex) {
                            slideNumber = slideIndex;
                            scope.onHold = true;
                            var slide = loadSlide(slideNumber);
                            if (!slide) {
                                return;
                            }
                             emitCurrentSlideChanged(slide);
                        });

                        scope.$on("slidesLoaded", function (e, slideIndex) {
                            scope.slidesLoaded = true;
                            
                            if (scope.onHold) {
                                slideNumber = 0;
                            } else {
                                slideNumber = -1;

                                loadNextSlide();
                            }
                        });
                    }

                    scope.$on("$destroy", function () {
                        timers.resetTimeouts();
                        scope.$emit("slideContextUnloaded");
                    });
                }
            };
        }]);
}());
