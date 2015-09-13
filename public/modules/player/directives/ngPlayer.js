/*jslint nomen: true, vars: true, unparam: true, todo: true*/
/*global angular*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayer', ['Timers', 'CssInjector',
        function (Timers, CssInjector) {

            return {
                scope: {
                    slides: "&"
                },
                transclude: true,
                template: '<section ng-repeat="slide in slides() track by $index">' + '<section ng-if="$index==currentIndex" class="{{slide.animationType}} slideShow" style="position:absolute" ng-player-slide animation-type="" player-slide="slide.content"></section>' + '</section>',
                link: function (scope, element, attrs) {
                    var slideNumber = -1;
                    var timers = new Timers();
                    var loadSlide = function (slideIndex) {
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

                        //prepare the stylesheet for the next slide and position the new slide
                        CssInjector.inject(scope, slide.content.css, function () {
                            scope.currentIndex = slideIndex;
                            scope.$emit("slideLoaded", slide);
                        });

                        return slide;
                    };

                    var loadNextSlide = function () {
                        if (!scope.slides) {
                            return;
                        }

                        if (scope.slideIsOnHold) {
                            return;
                        }

                        var slides = scope.slides();
                        slideNumber += 1;
                        if (slideNumber < 0 || slideNumber >= slides.length) {
                            slideNumber = 0;
                        }

                        var advanceSlide = function (delay) {
                            timers.registerTimeout('loadNextSlide', loadNextSlide, delay);
                        };

                        var slide = loadSlide(slideNumber);
                        if (!slide) { //if there were no slide displayed, than advance to the next one
                            advanceSlide(1000);
                            return;
                        }

                        slide.durationInSeconds = slide.durationInSeconds || 1;
                        advanceSlide(slide.durationInSeconds * 1000);
                    };

                    loadNextSlide();

                    scope.$on("moveSlideRight", function () {
                        timers.unRegisterTimeout('loadNextSlide');
                        loadNextSlide();
                    });

                    scope.$on("moveSlideLeft", function () {
                        timers.unRegisterTimeout('loadNextSlide');

                        slideNumber -= 2;
                        if (slideNumber < -1) {
                            slideNumber = scope.slides.length - 2;
                        }

                        loadNextSlide();
                    });

                    scope.$on("resetOnHold", function () {
                        scope.slideIsOnHold = false;
                        loadNextSlide();
                    });

                    scope.$on("putPlayerOnHold", function () {
                        scope.slideIsOnHold = true;
                    });

                    scope.$on("resetSlideShow", function () {
                        scope.slideIsOnHold = false;
                        timers.resetTimeouts();
                        loadNextSlide();
                    });

                    scope.$on("goToSlideNumber", function (e, slideIndex) {
                        slideNumber = slideIndex;
                        loadSlide(slideNumber);
                        scope.slideIsOnHold = true;
                    });

                    scope.$on("$destroy", function () {
                        timers.resetTimeouts();
                    });
                }
            };
        }]);
}());
