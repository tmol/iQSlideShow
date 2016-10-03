/*global angular*/
(function () {
    'use strict';

    // member attribute = member in slide to watch for changes
    // min-font-size attribute = minimum font size in pixels
    // max-font-size attribute = maximum font size in pixels
    // Directive must be used on the parent of an element with the .text-fill class
    angular.module('core').directive('textFill', ["$timeout", function ($timeout) {
        return {
            scope: {
                member: "@",
                minFontSize: "=",
                maxFontSize: "=",
            },
            link: function postLink(scope, element, attrs) {
                if ($(element).find('.text-fill').length === 0) {
                    return;
                }

                var applyTextFill = function() {
                    $(element).textfill({
                        minFontPixels: scope.minFontSize,
                        maxFontPixels: scope.maxFontSize,
                        innerTag: '.text-fill'
                    });
                }

                scope.$on('updateSlideContentPart', function (event, content, member, slidePartId) {
                    if (member === scope.member) {
                        $timeout(applyTextFill, 100, false);
                    }
                });

                scope.$on("currentSlideChanged", function () {
                    $timeout(applyTextFill, 100, false);
                });

                scope.$on("slideTemplateLoaded", function () {
                    $timeout(applyTextFill, 100, false);
                });

                $timeout(applyTextFill, 100, false);
            }
        };
    }]);
}());
