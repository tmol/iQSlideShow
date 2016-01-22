/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('activeNavHighlighter', ['$location', function (location) {
    'use strict';

    function link(scope, element, attrs) {
        var activeClass = attrs.activeNavHighlighter,
            path = '/' + attrs.url,
            defaultUrlSurrogate = '/' + attrs.activeNavHighlighterDefaultUrlSurrogate || 'not defined';
        scope.location = location;

        scope.$watch('location.path()', function (newPath) {
            if (newPath.startsWith(path)
                    || (newPath === '/' && defaultUrlSurrogate.startsWith(path))) {
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
