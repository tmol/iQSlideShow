/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('activeNavHighlighter', ['$location', function (location) {
    'use strict';

    function link(scope, element, attrs) {
        var activeClass = attrs.activeNavHighlighter;
        var path = '/' + attrs.url;
        scope.location = location;

        scope.$watch('location.path()', function(newPath) {
            if (path === newPath) {
                element.addClass(activeClass);
            } else {
                element.removeClass(activeClass);
            }
        });
    }

    return {
        link: link
    };
}]);
