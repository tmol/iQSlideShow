/*global angular*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('modalDialogPositioner', ['$timeout', '$rootScope', '$window', function ($timeout, $rootScope, $window) {
    'use strict';

    function link(scope, element, attrs) {

        scope.element = element;
        scope.$window = $window;

        scope.$watch(
            function () {
                return element.height();
            },
            function (value) {
                scope.setModalContentTopMargin();
            }
        );

        var setContainerStyle = function (style, value) {
            element.parent().parent().css(style, value);
        };

        scope.setModalContentTopMargin = function () {
            var windowHeight = angular.element(scope.$window).height(),
                modalContentHeight = scope.element.parent().height(),
                modalContentTopMargin = Math.max(0, (windowHeight - modalContentHeight) / 2.5);

            setContainerStyle('margin-top', modalContentTopMargin + 'px');
        };

        angular.element($window).bind('resize', function () {
            scope.setModalContentTopMargin();
        });

        $timeout(function () {
            scope.setModalContentTopMargin();
            setContainerStyle('visibility', 'visible');
        });
    }

    return {
        link: link
    };
}]);
