/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('dynamicResizer', ['$window', '$timeout', '$rootScope', function ($window, $timeout, $rootScope) {
    'use strict';

    function link(scope, element, attrs) {
        var window = angular.element($window);
        var heightWidthRatio = attrs.dynamicResizerHeightWidthRatio;

        var update = function () {
            var elementWidth = element.width();
            element.height(elementWidth * heightWidthRatio);
        };

        var lastTimeout;
        var onResize = function () {
            $timeout.cancel(lastTimeout);
            lastTimeout = $timeout(function () {
                update();
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            }, 10);

        };

        window.on('resize', onResize);

        $timeout(function () {
            update();
        });

        scope.$on('$destroy', function () {
            window.off('resize', onResize);
        });
    }

    return {
        link: link
    };
}]);
