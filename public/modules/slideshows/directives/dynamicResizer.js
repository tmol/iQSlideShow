/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('dynamicResizer', ['$window', function ($window) {
    'use strict';

    function link(scope, element, attrs) {
        var window = angular.element($window);
        var heightWidthRatio = attrs.heightWidthRatio;

        scope.getWidth = function () {
          return window.width();
        };

        scope.$watch(scope.getWidth, function (newValue, oldValue) {
            var elementWidth = element.width();
            element.height(elementWidth * heightWidthRatio);
        }, false);

        window.bind('resize', function () {
            scope.$apply();
        });

        scope.$on('$destory', function () {
            window.off('resize')
        });
    }

    return {
        link: link
    };
}]);
