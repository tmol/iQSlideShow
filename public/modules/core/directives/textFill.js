/*global angular*/
(function () {
    'use strict';

    // member attribute = member in slide to watch for changes (required)
    // min-font-size attribute = minimum font size in pixels (optional)
    // max-font-size attribute = maximum font size in pixels (required)
    // Directive must be used on the parent of an element with the .text-fill class
    angular.module('core').directive('textFill', ["$interval", function ($interval) {
        return {
            scope: {
                member: "@",
                minFontSize: "=?",
                maxFontSize: "="
            },
            link: function postLink(scope, element, attrs) {
                var failCounter = 1, maxFailCounter = 25;
                var applyInterval, applyTextFill;

                var stopApplyTextFill = function () {
                    if (applyInterval) {
                        $interval.cancel(applyInterval);

                        failCounter = 0;
                        applyInterval = null;
                    }
                };

                var startApplyTextFill = function () {
                    stopApplyTextFill();
                    
                    applyInterval = $interval(applyTextFill, 10, 0, false);
                };

                applyTextFill = function() {
                    scope.$emit("textFillStarted", scope.member);

                    $(element).textfill({
                        minFontPixels: scope.minFontSize || 8, // default to 8 px minimum font size
                        maxFontPixels: scope.maxFontSize,

                        // We don't care what type of element contains the text.
                        innerTag: '*',

                        success: function () {
                            stopApplyTextFill();

                            scope.$emit("textFillSuccessful", scope.member);
                        },
                        fail: function () {
                            failCounter++;

                            if (failCounter > maxFailCounter) {
                                stopApplyTextFill();

                                scope.$emit("textFillFailed", scope.member);
                            }
                        },
                    });
                };

                scope.$on("slidePartUpdated", function (event, content, member) {
                    if (member === scope.member) {
                        startApplyTextFill();
                    }
                });

                scope.$on("updateSlide", function () {
                    startApplyTextFill();
                })

                scope.$on("slideShown", function (event) {
                    startApplyTextFill();
                });

                scope.$on("$destroy", function () {
                    stopApplyTextFill();
                });
            }
        };
    }]);
}());
