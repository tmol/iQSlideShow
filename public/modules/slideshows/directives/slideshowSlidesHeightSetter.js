/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('slideshowSlidesHeightSetter', ['$window', '$timeout', '$rootScope', function ($window, $timeout, $rootScope) {
    'use strict';

    function link(scope, element, attrs) {
        var window = angular.element($window);
        var top = attrs.top;
        var footerHeight = attrs.footerHeight;

        var update = function () {
            var newHeight = window.height() - top - footerHeight,
                overflowY = 'hidden',
                slidesDivHeight = element.children().first().height();
            element.height(newHeight);
            if (slidesDivHeight > newHeight) {
                overflowY = 'scroll';
            }
            element.css('overflow-Y', overflowY);
            console.log('New scroll div height: ' + newHeight, ', slides div height: ' + slidesDivHeight, ' overflowY: ' + overflowY);
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

        scope.$watch('slideshow().draftSlides.length', function () {
            $timeout(function () {
                update();
                $timeout(function () {
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                });
            });
        });
    }

    return {
        link: link,
        scope: {
            slideshow: '&'
        }
    };
}]);
