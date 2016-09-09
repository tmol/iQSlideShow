/*global angular*/
(function () {
    'use strict';

    // min-font-size attribute = minimum font size in pixels
    // max-font-size attribute = maximum font size in pixels
    // Directive must be used on the parent of an element with the .text-fill class
    angular.module('core').directive('textFill', ["$timeout", function ($timeout) {
        return {
            link: function postLink(scope, element, attrs) {
                if ($(element).find('.text-fill').length === 0) {
                    return;
                }

                var minFontSize = parseFloat(attrs.minFontSize);
                var maxFontSize = parseFloat(attrs.maxFontSize);

                if (!minFontSize || !maxFontSize) {
                    return;
                }

                var applyTextFill = function() {
                    $(element).textfill({
                        minFontPixels: minFontSize,
                        maxFontPixels: maxFontSize,
                        innerTag: '.text-fill'
                    });
                }

                scope.$on('updateSlideContentPart', function (event, content, member, slidePartId) {
                    if (member === attrs.member) {
                        applyTextFill();
                    }
                });

                $timeout(applyTextFill, 100, false);
            }
        };
    }]);
}());
