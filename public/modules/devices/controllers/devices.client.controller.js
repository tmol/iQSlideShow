/*global angular*/
(function () {
    'use strict';

// Devices controller
    angular.module('devices').controller('DevicesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Devices',
        function ($scope, $stateParams, $location, Authentication, Slideshows, Devices) {
            $scope.authentication = Authentication;
            Slideshows.query(function (res) {
                $scope.slideshows = res;
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
                device.$save(function (response) {
                    $location.path('devices');

                    // Clear form fields
                    $scope.name = '';
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Remove existing Device
            $scope.remove = function (device) {
                var i;
                if (device) {
                    device.$remove();

                    for (i in $scope.devices) {
                        if ($scope.devices[i] === device) {
                            $scope.devices.splice(i, 1);
                        }
                    }
                } else {
                    $scope.device.$remove(function () {
                        $location.path('devices');
                    });
                }
            };

            // Update existing Device
            $scope.update = function () {
                var device = $scope.device;
                if (!device.active) {
                    device.active = false;
                }

                device.$update(function () {
                    $location.path('devices');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Find a list of Devices
            $scope.find = function () {
                $scope.devices = Devices.query();
            };

            // Find existing Device
            $scope.findOne = function () {
                $scope.device = Devices.get({
                    deviceId: $stateParams.deviceId
                });
            };

            $scope.cancel = function () {
                $location.path('devices');
            };
        }
        ]);
}());