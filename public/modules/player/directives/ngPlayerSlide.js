/*global angular*/
(function () {
    'use strict';
    angular.module('player').directive('ngPlayerSlide', ['$injector',
        function ($injector) {

            return {
                scope: {
                    slide: "=playerSlide",
                    slideBusiness:"=",
                    animationType: "="
                },
                template: "<section ng-include='slide.templateUrl'></section>",
                link:function(scope) {
                    if (scope.slideBusiness) {

                        $injector.invoke(scope.slideBusiness,scope,{"$scope":scope});
                    }
                }
            };
        }
    ]);
}());
