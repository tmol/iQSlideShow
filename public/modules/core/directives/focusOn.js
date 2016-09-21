/*global angular*/
(function () {
    'use strict';

    angular.module('core').directive('focusOn', ["$timeout", "$parse", function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var expr = $parse(attrs.focusOn);

                scope.$watch(expr, function (value) {
                    if (value) {
                        $timeout(function () {
                            element.focus();
                        }, 0, false);
                    }
                });
            }
        };
    }]);
}());
