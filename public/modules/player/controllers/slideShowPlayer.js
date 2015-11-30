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
            Slides.get({slideId : $stateParams.slideName}, function (result) {
                $scope.slides = result.slides;
                if (displaySlideNumber >= 0) {
                    $scope.$broadcast("goToSlideNumber", displaySlideNumber);
                }
            });
        }]);
}());
