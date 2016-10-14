/*global angular*/
(function () {
    'use strict';

    // slide attribute = slide containing the text-fill element (required)
    // member attribute = member in slide to watch for changes (required)
    // min-font-size attribute = minimum font size in pixels (optional)
    // max-font-size attribute = maximum font size in pixels (required)
    // Directive must be used on the parent of an element with the .text-fill class
    angular.module('core').directive('textFill', ["$interval", function ($interval) {
        return {
            scope: {
                slide: "=",
                member: "@",
                minFontSize: "=?",
                maxFontSize: "="
            },
            link: function postLink(scope, element, attrs) {
                var failCounter = 1, maxFailCounter = 10;
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

                    if (scope.slide.isEdit) {
                        applyInterval = $interval(applyTextFill, 10, 0, false);
                    } else if (scope.slide.content) {
                        var fontSizeMember = scope.member + "FontSize";
                        var fontSize = scope.slide.content[fontSizeMember];

                        if (fontSize) {
                            $(element).children().eq(0).css("font-size", fontSize);
                        }
                    }
                };

                applyTextFill = function() {
                    scope.$emit("textFillStarted", scope.member);

                    element.textfill({
                        minFontPixels: scope.minFontSize || 8, // default to 8 px minimum font size
                        maxFontPixels: scope.maxFontSize,

                        // We don't care what type of element contains the text.
                        innerTag: '*',

                        success: function () {
                            stopApplyTextFill();

                            element.removeClass("text-fill-error");
                            scope.$emit("textFillSuccessful", scope.member);

                            if (scope.slide.isEdit) {
                                var fontSize = parseFloat($(element).children().eq(0).css("font-size"));
                                var fontSizeMember = scope.member + "FontSize";

                                scope.slide.content = scope.slide.content || {};
                                scope.slide.content[fontSizeMember] = fontSize;
                            }
                        },
                        fail: function () {
                            failCounter++;

                            if (failCounter > maxFailCounter) {
                                stopApplyTextFill();

                                element.addClass("text-fill-error");
                                scope.$emit("textFillFailed", scope.member);

                                if (scope.slide.isEdit && scope.slide.content) {
                                    var fontSizeMember = scope.member + "FontSize";

                                    delete scope.slide.content[fontSizeMember];
                                }
                            }
                        },
                    });
                };

                scope.$on("slidePartUpdated", function (event, content, member) {
                    startApplyTextFill();
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
