/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides',
        function ($scope, $state, $stateParams, Slides) {
            Slides.get({slideId : $stateParams.slideshowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                    $scope.slideUrl = slide.detailsUrl || $state.href("player", {
                        slideName : $stateParams.slideshowId,
                        slideNumber : $stateParams.slideNumber
                    }, {absolute : true});

			     })
        }]);
}());
