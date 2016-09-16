/*global angular*/
(function () {
    'use strict';

    angular.module('core').directive('selectOn', ["$timeout", "$parse", function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var expr = $parse(attrs.selectOn);

                scope.$watch(expr, function (value) {
                    if (value) {
                        $timeout(function () {
                            element.select();
                        }, 0, false);
                    }
                });
            }
        };
    }]);
}());
