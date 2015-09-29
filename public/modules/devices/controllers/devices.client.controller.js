/*global angular*/
/*jslint nomen: true*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesController', ['$scope', '$stateParams', '$state', 'Authentication', 'Slideshows', 'Devices', 'ServerMessageBroker', '$modal', 'Admin', 'Timers',
        function ($scope, $stateParams, $state, Authentication, Slideshows, Devices, ServerMessageBroker, $modal, Admin, Timers) {
            var modalInstance,
                timers = new Timers(),
                messageBroker = new ServerMessageBroker();

            messageBroker.subscribe();

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
                device.$save(function () {
                    $state.go('listDevices');

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
                        $state.go('listDevices');
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
                    $state.go('listDevices');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.find = function () {
                Devices.query(function(result) {
                    $scope.devices = result;
                });
            };

            $scope.initDeviceList = function () {
                $scope.find();
                timers.registerTimeout('reloadDevicesForStatusUptaes', function () {
                    $scope.initDeviceList();
                }, 3 * 1000);
            };

            $scope.adminConfig = Admin.getConfig();

            $scope.getDeviceStatus = function (device) {
                if (!device.lastHealthReport) {
                    return 'unhealthy';
                }

                var lastHeathReport = new Date(device.lastHealthReport),
                    minutesPassedSinceLastHealthReport = (new Date().getTime() - lastHeathReport.getTime()) / (1000 * 60);
                if (minutesPassedSinceLastHealthReport > $scope.adminConfig.nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathy) {
                    return 'unhealthy';
                }

                return device.active ? 'active' : 'inactive';
            };

            // Find existing Device
            $scope.findOne = function () {
                $scope.device = Devices.get({
                    deviceId: $stateParams.deviceId
                });
            };

            $scope.cancel = function () {
                $state.go('listDevices');
            };

            $scope.cancelModal = function () {
                modalInstance.dismiss('cancel');
            };

            messageBroker.onNewDeviceSaidHi(function (message) {
                modalInstance = $modal.open({
                    animation: false,
                    templateUrl: 'receivedDeviceEventPopup.html',
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'EventHandlerModalController',
                    resolve: {
                        deviceEvent: function () {
                            return {
                                title: 'New device available',
                                description: 'A new device with id ' + message.deviceId + ' is available. You can activate it by clicking on the Edit button from below.',
                                deviceId: message.deviceId,
                                deviceObjectId: message.content.objectId
                            };
                        }
                    }
                });
            });

            $scope.addSlideShow = function () {
                $scope.device.slideAgregation.playList.push({
                    slideShow : $scope.selectedSlideShow
                });
            };

            $scope.removeSlideshow = function (slideShow) {
                var index = $scope.device.slideAgregation.playList.indexOf(slideShow);
                $scope.device.slideAgregation.playList.splice(index, 1);
            };

            $scope.$on("$destroy", function () {
                timers.resetTimeouts();
                messageBroker.unSubscribe();
            });
        }
        ]);
}());
