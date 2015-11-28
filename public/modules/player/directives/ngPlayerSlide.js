/*global angular*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayerSlide', ['$injector', '$interval',
        function ($injector, $interval) {

            return {
                scope: {
                    slide: "=playerSlide",
                    slideBusiness:"=",
                    animationType: "="
                },
                template: "<div style='width:100%;height:100%;position:absolute' ng-slide-view reference-slide='slide'></div>",
                link:function(scope, element) {
                    scope.width = $(window).width();
                        scope.height = $(window).height();
                    if (scope.slideBusiness) {

                        $injector.invoke(scope.slideBusiness,scope,{"$scope":scope});
                    }
                    var interval = $interval(function () {
                        scope.width = $(window).width();
                        scope.height = $(window).height();
                    }, 1000);
                    scope.$on("$destroy", function () {
                        $interval.cancel(interval);
                    });
                }

            };
        }
    ]);
}());
