(function () {
    'use strict';
    var angular = window.angular || {};
    angular.module('slideshows').controller('DevicesController', ['$scope', 'Devices',
        function ($scope, Devices) {
            Devices.get(function (res) {
                $scope.devices = res.devices;
            });
        }]);
}());
