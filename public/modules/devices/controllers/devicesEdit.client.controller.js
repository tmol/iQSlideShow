/*jslint nomen: true*/
/*global angular, _, confirm*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesEditController', ['$scope', '$stateParams', 'Authentication', '$state', 'Slideshows', 'Devices', 'Admin', 'DeviceStatusService', '$uibModal', 'Path', 'ActionResultDialogService', '$timeout', 'DragAndDropItemsArray', 'Timers',
        function ($scope, $stateParams, Authentication, $state, Slideshows, Devices, Admin, DeviceStatusService, $uibModal, Path, ActionResultDialogService, $timeout, DragAndDropItemsArray, Timers) {
            var modalInstance,
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
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    return;
                }
                ActionResultDialogService.showOkCancelDialog('Are you sure do you want to remove the device?', $scope, function () {
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                    $scope.device.$remove(function () {
                        $scope.device = null;
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                        ActionResultDialogService.showOkDialog('Remove was successful.', $scope, function () {
                            $state.go('listDevices');
                        });
                    }, function (err) {
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                        ActionResultDialogService.showErrorDialog('Remove unsuccessful.', err.data.message, $scope);
                    }
                                         );
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

            function initDeviceStatus() {
                $scope.device.status = DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
            }

            function initDragAndDropIds() {
                _.forEach($scope.getPlaylist(), function (item) {
                    item.dragAndDropId = item.slideShow._id;
                });
            }

            function initAfterLoadingDevice() {
                var playlist = $scope.getPlaylist();

                dragAndDropItemsArray = new DragAndDropItemsArray($scope.getDraggableItemsArray());
                playlist.moveGivenPlacesSlideShowInPlaylist = function (item, placesToMove) {
                    var index = playlist.indexOf(item),
                        newIndex = index + placesToMove;

                    dragAndDropItemsArray.moveItemInItemsList(item, newIndex);
                };
                initDeviceStatus();
                initDragAndDropIds();
                initDeviceJson();
            }

            // Update existing Device
            $scope.update = function () {
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    return;
                }
                var device = $scope.device;

                if ($scope.getPlaylist().length === 0) {
                    ActionResultDialogService.showWarningDialog('Please select at least one slideshow.', $scope, function () { return; });
                    return;
                }
                if (!device.active) {
                    device.active = false;
                }
                $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                device.$update(function () {
                    initAfterLoadingDevice();
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                    ActionResultDialogService.showOkDialog('Save was successful.', $scope);
                }, function (errorResponse) {
                    var errMsg = 'Error ocurred during update.';
                    if (errorResponse && errorResponse.data && errorResponse.data.message) {
                        errMsg = errorResponse.data.message;
                    }
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                    ActionResultDialogService.showWarningDialog(errMsg, $scope);
                });
            };

            $scope.adminConfig = Admin.getConfig();

            $scope.getDeviceStatus = function (device) {
                return DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
            };

            $scope.find = function () {
                Devices.get({
                    deviceId: $stateParams.deviceId
                }, function (result) {
                    $scope.device = result;
                    initAfterLoadingDevice();
                    timers.registerInterval('reloadDevicesForStatusUpdates', function () {
                        Devices.get({
                            deviceId: $stateParams.deviceId
                        }, function (device) {
                            $scope.device.status = DeviceStatusService.getStatus(device, $scope.adminConfig);
                            $scope.device.lastHealthReport = device.lastHealthReport;
                        });
                    }, 30 * 1000);
                });
            };

            $scope.getPlaylist = function () {
                return $scope.device.slideAgregation.playList;
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
                        $scope.getPlaylist().push({
                            slideShow : selectedSlideShow,
                            dragAndDropId: selectedSlideShow._id
                        });
                    });
                });
            };

            $scope.removeSlideshow = function (slideShow) {
                var index = $scope.getPlaylist().indexOf(slideShow);
                $scope.getPlaylist().splice(index, 1);
            };

            $scope.navigateToEdit = function (slideshowId) {
                $state.go('editSlideshow', {slideshowId: slideshowId});
            };

            $scope.moveSlideShowLeft = function (playListEntry) {
                $scope.getPlaylist().moveGivenPlacesSlideShowInPlaylist(playListEntry, -1);
            };

            $scope.moveSlideShowRight = function (playListEntry) {
                $scope.getPlaylist().moveGivenPlacesSlideShowInPlaylist(playListEntry, 1);
            };

            $scope.getDraggableItemsArray = function () {
                return {
                    items: $scope.getPlaylist(),
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
                var playlist = $scope.getPlaylist(),
                    entryIndex = _.findIndex(playlist, function (entry) {
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
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    event.preventDefault();
                }
            });

            $scope.$on("slidesLoaded", function (event, slides, slideShowId) {
                var playlist = $scope.getPlaylist(),
                    entryIndex = _.findIndex(playlist, function (entry) {
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
