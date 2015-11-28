/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB*/
(function () {
    'use strict';
    angular.module('player').controller('SlideShowPlayerController', ['$scope', '$stateParams', '$state', 'Slides',
        function ($scope, $stateParams, $state, Slides) {
            $scope.slides = [];
            var displaySlideNumber = $stateParams.slideNumber;
            if (!$stateParams.slideNumber) {
                displaySlideNumber = -1;
            }
            var setupSlides = function () {
                $scope.slides.forEach(function (slide, index) {
                    slide.content = slide.content || {};
                    slide.content.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                    slide.content.css = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.css';
                    slide.content.js = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.js';
                    slide.content.resolution = slide.resolution;
                    slide.content.zoomPercent = slide.zoomPercent;
                    slide.index = index;
                });
            };
            Slides.get({slideId : $stateParams.slideName}, function (result) {
                $scope.slides = result.slides;
                setupSlides();
                if (displaySlideNumber >= 0) {
                    $scope.$broadcast("goToSlideNumber", displaySlideNumber);
                }
            });
        }]);
}());
