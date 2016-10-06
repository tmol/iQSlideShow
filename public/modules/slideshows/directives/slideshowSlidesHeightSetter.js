/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('slideshowSlidesHeightSetter', ['$window', '$timeout', '$rootScope', function ($window, $timeout, $rootScope) {
    'use strict';

    function link(scope, element, attrs) {
        var window = angular.element($window);
        var top = attrs.top;
        var footerHeight = attrs.footerHeight;
        var me = this;

        var update = function () {
            $timeout.cancel(lastTimeout);
            lastTimeout = $timeout(function () {
                var newHeight = window.height() - top - footerHeight,
                    overflowY = 'hidden',
                    slidesDivHeight = element.children().first().height();
                element.height(newHeight);
                if (slidesDivHeight > newHeight) {
                    overflowY = 'scroll';
                }
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
                element.css('overflow-y', overflowY);
            });
        };

        var lastTimeout;
        var onResize = function () {
            update();
        };

        window.on('resize', onResize);

        update();

        scope.$on('$destroy', function () {
            window.off('resize', onResize);
        });

        scope.$watch('slidesHeightSetterStrategy().getSlides().length', function () {
            update();
            scope.slidesHeightSetterStrategy().reselectCurrentSlideToFixChormeHeightCalculationBug();
        });
    }

    return {
        link: link,
        scope: {
            slidesHeightSetterStrategy: '&',
            slideshow: '&'
        }
    };
}]);
