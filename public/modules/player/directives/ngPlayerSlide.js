/*global angular*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayerSlide', [
        function () {

            return {
                scope: {
                    slide: "=playerSlide",
                    animationType: "="
                },
                template: "<section ng-include='slide.templateUrl'></section>"
            };
        }
    ]);
}());
