/*global angular*/

(function() {
    'use strict';

    angular.module('core').directive('textResizer', function() {
        return {
            link: function postLink(scope, element, attrs, section) {
                scope.$watch('slide.content.' + attrs.member, function(fontSize) {
                    fontSize = parseFloat(fontSize);

                    if (fontSize) {
                        element.css('font-size', fontSize);
                    } else {
                        element.css('font-size', '');
                    }
                });
            }
        };
    });
}());
