/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('slideShowTileDynamicResizer', ['$window', function ($window) {
    'use strict';

    function link(scope, element, attrs) {
        var window = angular.element($window);

        scope.getWidth = function () {
          return window.width();
        };

        scope.$watch(scope.getWidth, function (newValue, oldValue) {
            var elementWidth = element.width();
            element.height(elementWidth * scope.heightWidthRatio);
        }, false);

        window.bind('resize', function () {
            scope.$apply();
        });

        scope.$on('$destory', function () {
            window.off('resize')
        });
    }

    return {
        link: link,
        scope: {
            heightWidthRatio: '=heightWidthRatio'
        }
    };
}]);
