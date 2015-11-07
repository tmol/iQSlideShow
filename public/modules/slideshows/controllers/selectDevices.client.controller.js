/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('SelectDevicesController', ['$scope', '$stateParams', 'Slideshows',
        function ($scope, $stateParams, Slideshows) {
            $scope.search = function () {
                $scope.devices = Slideshows.getDevices({
                    slideshowId: $stateParams.slideshowId
                }, {name: $scope.filter});
            };
            $scope.search();
            $scope.save = function () {
                var selectedDevices = $scope.devices.filter(function (device) {
                    return device.checked;
                });
                Slideshows.setDevices({slideshowId: $stateParams.slideshowId}, selectedDevices)
                    .$promise.then(function () {
                        $scope.$close();
                    });
            };
        }]);
}());
