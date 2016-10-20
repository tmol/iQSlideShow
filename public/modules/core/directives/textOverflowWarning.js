/*global angular*/
(function () {
    'use strict';

    angular.module('core').directive('textOverflowWarning', ['$interval', function ($interval) {
        return {
            link: function postLink(scope, element, attrs) {
                var failCounter = 1, maxFailCounter = 10;
                var checkInterval, checkOverflow;

                var stopOverflowCheck = function () {
                    if (checkInterval) {
                        $interval.cancel(checkInterval);

                        failCounter = 0;
                        checkInterval = null;
                    }
                };

                var startOverflowCheck = function () {
                    stopOverflowCheck();

                    checkInterval = $interval(checkOverflow, 10, 0, false);
                };

                checkOverflow = function() {
                    var text = element.children().first();

                    if (element.is(':visible') && text.is(':visible')) {
                        var widthOveflow = text.width() > element.width();
                        var heightOverflow = text.height() > element.height();

                        if (widthOveflow || heightOverflow) {
                            if (scope.slide.isEdit) {
                                element.addClass('overflow-error');
                            }
                        } else {
                            element.removeClass('overflow-error');
                        }

                        stopOverflowCheck();
                    } else {
                        failCounter++;

                        if (failCounter > maxFailCounter) {
                            stopOverflowCheck();

                            if (scope.slide.isEdit) {
                                element.addClass('overflow-error');
                            }
                        }
                    }
                };

                scope.$on('slidePartUpdated', function (event, content, member) {
                    startOverflowCheck();
                });

                scope.$on('$destroy', function () {
                    stopOverflowCheck();
                });
            }
        };
    }]);
}());
