/*global angular*/
/*jslint nomen: true*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesController', ['$scope', '$stateParams', '$state', 'Authentication', 'Slideshows', 'Devices', 'MessagingEngineFactory', '$modal',
        function ($scope, $stateParams, $state, Authentication, Slideshows, Devices, MessagingEngineFactory, $modal) {
            var messagingEngine = MessagingEngineFactory.getEngine(),
                modalInstance,
                messageHandler;
            messagingEngine.subscribe();

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
                var device = $scope.device,
                    storedDevice,
                    deviceSetupMessageContent;

                if (!device.active) {
                    device.active = false;
                }

                device.$update(function () {
                    $state.go('listDevices');
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
                $state.go('listDevices');
            };

            $scope.cancelModal = function () {
                modalInstance.dismiss('cancel');
            };

            messageHandler = {
                newDeviceSaidHi: function (message) {
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
                },
                inactiveRegisteredDeviceSaidHi: function (message) {
                    // todo check if we have to do anything here
                }
            };

            // todo cde duplication, factor out, see player.client.controller
            $scope.$on(messagingEngine.messageEvent, function (event, payload) {
                var message = payload.message;
                if (messageHandler[message.action]) {
                    messageHandler[message.action](message);
                }
            });
        }
        ]);
}());