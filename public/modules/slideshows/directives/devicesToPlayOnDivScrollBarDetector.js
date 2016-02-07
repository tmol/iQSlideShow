/*global angular*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('devicesToPlayOnDivScrollBarDetector', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    'use strict';

    function link(scope, element, attrs) {

        scope.$watch(
            function () {
                var domElement = element[0];
                return domElement.scrollHeight > domElement.clientHeight;
            },
            function (value) {
                if (value) {
                    $rootScope.$broadcast('devicesToPlayOnDivScrollBarVisible');
                }
            }
        );
    }

    return {
        link: link
    };
}]);
