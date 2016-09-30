/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesController', ['$scope', '$state', 'Authentication', 'Slideshows', 'Devices', 'ServerMessageBroker', 'Admin', 'Timers', '$cacheFactory', 'DeviceStatusService', '$uibModal',
        function ($scope, $state, Authentication, Slideshows, Devices, ServerMessageBroker, Admin, Timers, $cacheFactory, DeviceStatusService, $uibModal) {
            var modalInstance,
                timers = new Timers(),
                messageBroker = new ServerMessageBroker();

            messageBroker.subscribe();

            $scope.authentication = Authentication;
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            // Remove existing Device
            $scope.remove = function (device) {
                var i;
                device.$remove();

                for (i in $scope.devices) {
                    if ($scope.devices[i] === device) {
                        $scope.devices.splice(i, 1);
                    }
                }
            };

            $scope.find = function () {
                $scope.filterDevices();
            };

            $scope.initDeviceList = function () {
                $scope.find();
                timers.registerInterval('reloadDevicesForStatusUptaes', function () {
                    $scope.filterDevices();
                }, 60 * 1000);
            };

            $scope.adminConfig = Admin.getConfig();

            $scope.getDeviceStatus = function (device) {
                return DeviceStatusService.getStatus(device, $scope.adminConfig);
            };

            $scope.cancel = function () {
                $state.go('listDevices');
            };

            messageBroker.onNewDeviceSaidHi(function (message) {
                modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'receivedDeviceEventPopup.html',
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'EventHandlerModalController',
                    resolve: {
                        deviceEvent: function () {
                            return {
                                title: 'New device available',
                                description: "A new device with id " + message.content.objectId + " is available. You can activate it by clicking on the 'Edit Device' button from below.",
                                deviceId: message.content.objectId,
                                deviceObjectId: message.content.objectId
                            };
                        }
                    }
                });
            });

            $scope.cache = $cacheFactory.get('devices.client.controller');
            if (angular.isUndefined($scope.cache)) {
                $scope.cache = $cacheFactory('devices.client.controller');
            }

            $scope.filterParameters = $scope.cache.get('devices.client.controller.filterParameters');
            if (angular.isUndefined($scope.filterParameters)) {
                $scope.filterParameters = {
                    namesAndTagsFilterParameters: {},
                    noFilterApplied: function () {
                        return this.showOnlyMine === false
                            && this.namesAndTagsFilterParameters.filterItems.length === 0
                            && this.namesAndTagsFilterParameters.nameFilters.length === 0
                            && this.namesAndTagsFilterParameters.tagFilters.length === 0
                            && (this.namesAndTagsFilterParameters.namesAndTagsFilter === ''
                                || !this.namesAndTagsFilterParameters.namesAndTagsFilter);
                    }
                };
            }

            $scope.filterDevices = function () {
                Devices.list({
                    nameFilters: $scope.filterParameters.namesAndTagsFilterParameters.nameFilters,
                    tagFilters: $scope.filterParameters.namesAndTagsFilterParameters.tagFilters,
                    namesAndTagsFilter: $scope.filterParameters.namesAndTagsFilterParameters.namesAndTagsFilter
                }, function (result) {
                    $scope.devices = result;
                });
            };

            $scope.searchProvider = {
                filterEventName: 'filterDevices',
                cacheId: 'devicesFilter',
                filter: function (filterParameters) {
                    $scope.filterParameters.namesAndTagsFilterParameters = filterParameters;
                    $scope.filterDevices();
                },
                getPossibleFilterValues: function (search, excluded, callback) {
                    Devices.getFilteredNames({
                        namesAndTagsFilter: search,
                        excluded: excluded
                    }, function (filterResult) {
                        callback(filterResult);
                    });
                }
            };

            $scope.editDevice = function (device) {
                $state.go('editDevice', {deviceId: device.deviceId});
            };

            $scope.$on("filterDevices", function () {
                $scope.filterDevices();
            });

            $scope.$on("$destroy", function () {
                timers.reset();
                messageBroker.unSubscribe();
                $scope.cache.put('devices.client.controller.filterParameters', $scope.filterParameters);
            });
        }
        ]);
}());
