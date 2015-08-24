/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DevicesController', ['$scope', 'Devices', 'Slideshows',
        function ($scope, Devices, Slideshows) {
            Devices.get(function (res) {
                $scope.devices = res.devices;
            });

            Slideshows.query(function(res) {
                $scope.slideshows = res;
            });

            $scope.setSlideShow = function(device) {
                idx = 0;
            }
        }]);
}());
