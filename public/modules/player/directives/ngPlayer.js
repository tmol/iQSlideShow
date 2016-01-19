/*jslint nomen: true, vars: true, unparam: true, todo: true*/
/*global angular*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayer', ['Timers', 'CssInjector', 'JsInjector',
        function (Timers, CssInjector, JsInjector) {
            var i = 0;

            return {
                scope: {
                    slides: "&",
                    inPreview: '&'
                },
                transclude: true,
                template: '<div ng-repeat="slide in slides() track by $index" ng-if="$index==currentIndex" class="{{slide.animationType}} slideShow" style="width:100%;height:100%;position:absolute;display:block" ng-slide-view is-playing="true" reference-slide="slide">'
                    + '</div>',
                link: function (scope, element, attrs) {
                    console.log('INIT ng player; ' + i++);
                    if (!scope.inPreview()) {
                        console.log('scope.inPreview false ' + scope.$id);
                    } else {
                        console.log('scope.inPreview true ' + scope.$id);
                    }

                    var slideNumber = -1;
                    var timers = new Timers();
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

                        if (!slide.content) {
                            return null;
                        }
                        scope.$emit("currentSlideChanged", slideNumber);
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

                        if ((scope.onHold  || scope.inPreview()) && !forcedLoad) {
                            return;
                        }

                        var slides = scope.slides();
                        slideNumber += 1;
                        if (slideNumber < 0 || slideNumber >= slides.length) {
                            slideNumber = 0;
                        }
                        var slide = loadSlide(slideNumber);
                        if (!slide) { //if there were no slide displayed, than advance to the next one
                            advanceSlide(1000);
                            return;
                        }
                    };

                    scope.$on("slideLoaded", function (event, slide) {
                        slide.durationInSeconds = slide.durationInSeconds || 1;
                        advanceSlide(slide.durationInSeconds * 1000);
                    });

                    scope.$watch("slides", function () {
                        timers.resetTimeouts();
                        slideNumber = -1;
                        loadNextSlide();

                    });

                    scope.$on("moveSlideRight", function () {
                        timers.unRegisterTimeout('loadNextSlide');
                        loadNextSlide(true);
                    });

                    scope.$on("moveSlideLeft", function () {
                        timers.unRegisterTimeout('loadNextSlide');

                        slideNumber -= 2;
                        if (slideNumber < -1) {
                            slideNumber = scope.slides.length - 2;
                        }

                        loadNextSlide(true);
                    });

                    scope.$on("resetOnHold", function () {
                        scope.onHold = false;
                        loadNextSlide();
                    });

                    scope.$on("putPlayerOnHold", function () {
                        scope.onHold = true;
                    });

                    scope.$on("resetSlideShow", function () {
                        scope.onHold = false;
                        timers.resetTimeouts();
                        loadNextSlide();
                    });

                    scope.$on("goToSlideNumber", function (e, slideIndex) {
                        console.log("goToSlideNumber ENTER");
                        slideNumber = slideIndex;
                        scope.onHold = true;
                        loadSlide(slideNumber);
                    });

                    scope.$watch("onHold", function (newVal, old) {
                        console.log('onHold new value: ' + newVal);
                    });

                    scope.$on("$destroy", function () {
                        timers.resetTimeouts();
                        scope.$emit("slideContextUnloaded");
                    });
                }
            };
        }]);
}());
