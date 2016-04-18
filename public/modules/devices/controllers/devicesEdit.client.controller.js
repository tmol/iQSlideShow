/*jslint nomen: true*/
/*global angular, _, confirm*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesEditController', ['$scope', '$stateParams', 'Authentication', '$state', 'Slideshows', 'Devices', 'Admin', 'DeviceStatusService', '$uibModal', 'Path', 'ActionResultDialogService', '$timeout', 'DragAndDropItemsArray', 'Timers',
        function ($scope, $stateParams, Authentication, $state, Slideshows, Devices, Admin, DeviceStatusService, $uibModal, Path, ActionResultDialogService, $timeout, DragAndDropItemsArray, Timers) {
            var modalInstance,
                playlist,
                lastIndexMovedDuringDragAndDrop,
                dragAndDropItemsArray,
                timers = new Timers();

            $scope.authentication = Authentication;
            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            Admin.getLocations(function (locations) {
                $scope.locations = locations;
            });

            // Remove existing Device
            $scope.remove = function (device) {
                ActionResultDialogService.showOkCancelDialog('Are you sure do you want to remove the device?', $scope, function () {
                    $scope.device.$remove(function () {
                        ActionResultDialogService.showOkDialog('Remove was successful.', $scope, function () {
                            $state.go('listDevices');
                        });
                    });
                });
            };

            function getCleanedUpDeviceJson() {
                var idx;

                var clone = _.cloneDeep($scope.device);
                delete clone.status;
                _.forEach(clone.slideAgregation.playList, function (playListItem) {
                    delete playListItem.$$hashKey;
                    delete playListItem.playerScope;
                    delete playListItem.currentSlideNr;
                    delete playListItem.numberOfSlides;
                });

                return JSON.stringify(clone);
            }

            function initDeviceJson() {
                $scope.deviceJson = getCleanedUpDeviceJson();
            }

            function deviceChanged() {
                if (!$scope.device) {
                    return false;
                }
                return getCleanedUpDeviceJson() !== $scope.deviceJson;
            }

            function initDeviceStatus(device) {
                $scope.device.status = DeviceStatusService.getStatus(device, $scope.adminConfig);
            }

            // Update existing Device
            $scope.update = function () {
                var device = $scope.device;

                if (!device.active) {
                    device.active = false;
                }
                device.$update(function () {
                    ActionResultDialogService.showOkDialog('Save was successful.', $scope, function () {
                        initDeviceStatus(device);
                        initDeviceJson();
                    });
                }, function (errorResponse) {
                    ActionResultDialogService.showWarningDialog(errorResponse.data.message, $scope);
                });
            };

            $scope.adminConfig = Admin.getConfig();

            $scope.getDeviceStatus = function (device) {
                return DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
            };

            function refreshStatusPeriodically() {
                timers.registerInterval('reloadDevicesForStatusUptaes', function () {
                    Devices.get({
                        deviceId: $stateParams.deviceId
                    }, function (device) {
                        initDeviceStatus(device);
                    });
                }, 30 * 1000);
            }

            $scope.find = function () {
                Devices.get({
                    deviceId: $stateParams.deviceId
                }, function (result) {
                    $scope.device = result;
                    playlist = $scope.device.slideAgregation.playList;
                    dragAndDropItemsArray = new DragAndDropItemsArray($scope.getDraggableItemsArray());
                    playlist.moveGivenPlacesSlideShowInPlaylist = function (item, placesToMove) {
                        var index = playlist.indexOf(item),
                            newIndex = index + placesToMove;

                        dragAndDropItemsArray.moveItemInItemsList(item, newIndex);
                    };
                    initDeviceStatus($scope.device);
                    _.forEach(playlist, function (item) {
                        item.dragAndDropId = item.slideShow._id;
                    });
                    initDeviceJson();
                    refreshStatusPeriodically();
                });
            };

            $scope.cancel = function () {
                $state.go('listDevices');
            };

            $scope.addSlideShow = function () {
                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectSlideShows'),
                    windowClass: 'iqss-deviceedit-selectSlideShows-container',
                    backdrop: 'static',
                    controller: 'SelectSlideShowsController',
                    scope: $scope
                }).result.then(function (selectedSlideShows) {
                    if (!selectedSlideShows) {
                        return;
                    }

                    _.forEach(selectedSlideShows, function (selectedSlideShow) {
                        playlist.push({
                            slideShow : selectedSlideShow,
                            dragAndDropId: selectedSlideShow._id
                        });
                    });
                });
            };

            $scope.removeSlideshow = function (slideShow) {
                var index = playlist.indexOf(slideShow);
                playlist.splice(index, 1);
            };

            $scope.navigateToEdit = function (slideshowId) {
                $state.go('editSlideshow', {slideshowId: slideshowId});
            };

            $scope.moveSlideShowLeft = function (playListEntry) {
                playlist.moveGivenPlacesSlideShowInPlaylist(playListEntry, -1);
            };

            $scope.moveSlideShowRight = function (playListEntry) {
                playlist.moveGivenPlacesSlideShowInPlaylist(playListEntry, 1);
            };

            $scope.getDraggableItemsArray = function () {
                return {
                    items: playlist,
                    dragAndDropItemsArray: dragAndDropItemsArray,
                    lastIndexMovedDuringDragAndDrop: lastIndexMovedDuringDragAndDrop,
                    itemsChanged: function () {
                        $timeout(function () {
                            $scope.$apply();
                        });
                    },
                    itemDropped: function () {
                    }
                };
            };

            $scope.$on('currentSlideChanged', function (event, currentIndex, slideShowId) {
                var entryIndex = _.findIndex(playlist, function (entry) {
                    return entry.slideShow._id === slideShowId;
                });

                if (entryIndex === -1) {
                    return;
                }
                playlist[entryIndex].currentSlideNr = currentIndex + 1;
            });

            $scope.$on('$stateChangeStart', function (event) {
                if (deviceChanged()) {
                    var answer = confirm("The device was changed. Are you sure you want to leave this page?");
                    if (!answer) {
                        event.preventDefault();
                    }
                }
            });

            $scope.$on("slidesLoaded", function (event, slides, slideShowId) {
                var entryIndex = _.findIndex(playlist, function (entry) {
                    return entry.slideShow._id === slideShowId;
                });

                if (entryIndex === -1) {
                    return;
                }
                playlist[entryIndex].numberOfSlides = event.targetScope.numberOfSlides;
            });

            $scope.$on("$destroy", function () {
                timers.reset();
            });

            $timeout(function () {
                $scope.$apply();
            });
        }
        ]);
}());
