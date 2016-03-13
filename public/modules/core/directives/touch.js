/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('touchStart', ['$document', function ($document) {
    'use strict';

    return {
        link: function (scope, element, attrs) {
            var onTouch = function (event) {
                scope.$event = event;
                scope.$apply(attrs.touchStart, event);
                scope.$event = null;
            }
            element.on("touchstart click", onTouch);
            scope.$on("$destroy", function () {
                element.off("touchstart click", onTouch);
            });
        }
    };
}]);
