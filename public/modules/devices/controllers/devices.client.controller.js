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
                    filterEventName: 'filterDevices',
                    removeItemFromFilter: function (filterItem) {
                        _.pull(this.filterItems, filterItem);
                        $scope.filterDevices();
                    },
                    filterItems: [],
                    isNotEmpty: function () {
                        return this.filterItems.length > 0;
                    },
                    clear: function () {
                        this.filterItems = [];
                        $scope.filterDevices();
                    }
                };
            }

            $scope.possibleSearchedDeviceNames = [ ];

            $scope.refreshPossibleSearchedDeviceNamesAndDevices = function (search) {
                $scope.filterParameters.name = search;
                if (search.length === 0) {
                    $scope.possibleSearchedDeviceNames = [];
                    $scope.filterDevices();
                    return;
                }

                Devices.getFilteredNames({
                    nameFilter: search
                }, function (filteredNames) {
                    var uniqueDevicesName = _.uniq(_.map(filteredNames, 'name'));
                    $scope.possibleSearchedDeviceNames = _.sortBy(uniqueDevicesName, function (name) {
                        return name.toLowerCase();
                    });
                });
            };

            $scope.initNameSearchFilter = function (select) {
                var searchFilter = $scope.filterParameters.name;
                select.search = angular.isUndefined(searchFilter)
                    ? '' : searchFilter;
            };

            $scope.filterDevices = function (select) {
                if (!angular.isUndefined(select) && select.clickTriggeredSelect === false) {
                    $scope.filterParameters.name = select.placeholder;
                }
                Devices.query({
                    name: $scope.filterParameters.name
                }, function (result) {
                    $scope.devices = result;
                });
            };

            $scope.searchProvider = {
                filterEventName: 'filterDevices',
                cacheId: 'devicesFilter',
                filter: function (filterParameters) {
                    $scope.filterParameters.name = filterParameters.namesAndTagsFilter;
                    $scope.filterDevices();
                },
                getPossibleFilterValues: function (search, callback) {
                    Devices.getFilteredNames({
                        nameFilter: search
                    }, function (filteredNames) {
                        var uniqueDevicesName = _.uniq(filteredNames);
                        callback({names: uniqueDevicesName});
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
