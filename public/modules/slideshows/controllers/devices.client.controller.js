(function () {
    'use strict';
    window.angular.module('slideshows').controller('DevicesController', ['$scope', 'Devices',
        function ($scope, Devices) {
            Devices.get(function (res) {
                $scope.devices = res.devices;
            });
        }]);
}());
