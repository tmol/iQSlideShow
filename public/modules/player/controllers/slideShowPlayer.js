/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('SlideShowPlayerController', ['$scope', '$stateParams', '$state', 'Slides',
        function ($scope, $stateParams, $state, Slides) {
            $scope.slides = [];
            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(true);
            }
            var setupSlides = function () {
                $scope.slides.forEach(function (slide, index) {
                    slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                    slide.content.css = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css';
                    slide.index = index;
                });
            };
            Slides.get({slideId : $stateParams.slideName}, function (result) {
                    $scope.slides = result.slides;
                    setupSlides();
                });


            $scope.$on("$destroy", function () {
                if ($scope.setPlayerMode) {
                    $scope.setPlayerMode(false);
                }
            });

        }]);
}());
