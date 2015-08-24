/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').controller('DevicesController', ['$scope', 'Devices',
        function ($scope, Devices) {
            Devices.get(function (res) {
                $scope.devices = res.devices;
            });
        }]);
}());
