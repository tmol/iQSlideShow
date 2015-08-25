/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DeviceInteractionController', ['$scope', '$state', '$stateParams', 'Slides', 'Devices', 'Slideshows',
        function ($scope, $state, $stateParams, Slides, Devices, Slideshows) {
            $scope.deviceId = $stateParams.deviceId;
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });
            Devices.get({deviceId : $stateParams.deviceId}, function (res) {
                $scope.device = res.device;
            });
            Slides.get({slideId : $stateParams.slideshowId, slideNumber : $stateParams.slideNumber}, function (slide) {
                $scope.slideUrl = slide.detailsUrl || $state.href("player", {
                    slideName : $stateParams.slideshowId,
                    slideNumber : $stateParams.slideNumber
                }, {absolute : true});
            });
            $scope.setSlideShow = function (device) {
                var idx = 0;
            };
        }]);
}());
