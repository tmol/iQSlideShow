/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesEditController', ['$scope', '$stateParams', 'Authentication', '$state', 'Slideshows', 'Devices', 'Admin', 'DeviceStatusService',
        function ($scope, $stateParams, Authentication, $state, Slideshows, Devices, Admin, DeviceStatusService) {
            var modalInstance;

            $scope.authentication = Authentication;
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            Admin.getLocations(function (locations) {
                $scope.locations = locations;
            });

            // Create new Device
            $scope.create = function () {
                // Create new Device object
                if (!this.active) {
                    this.active = false;
                }
                var device = new Devices({
                    deviceId: this.deviceId,
                    name: this.name,
                    location: this.location,
                    defaultSlideShowId: this.defaultSlideShowId,
                    active: this.active
                });

                // Redirect after save
                device.$create(function () {
                    $state.go('listDevices');

                    // Clear form fields
                    $scope.name = '';
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Remove existing Device
            $scope.remove = function (device) {
                $scope.device.$remove(function () {
                    $state.go('listDevices');
                });
            };

            // Update existing Device
            $scope.update = function () {
                var device = $scope.device;

                if (!device.active) {
                    device.active = false;
                }
                device.$update(function () {
                    $state.go('listDevices');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.adminConfig = Admin.getConfig();

            $scope.getDeviceStatus = function (device) {
                return DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
            };

            // Find existing Device
            $scope.findOne = function () {
                Devices.get({
                    deviceId: $stateParams.deviceId
                }, function (result) {
                    $scope.device = result;
                    $scope.device.status = DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
                });
            };

            $scope.cancel = function () {
                $state.go('listDevices');
            };

            $scope.addSlideShow = function () {
                $scope.device.slideAgregation.playList.push({
                    slideShow : $scope.selectedSlideShow
                });
            };

            $scope.removeSlideshow = function (slideShow) {
                var index = $scope.device.slideAgregation.playList.indexOf(slideShow);
                $scope.device.slideAgregation.playList.splice(index, 1);
            };
        }
        ]);
}());
