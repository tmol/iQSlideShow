/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesEditController', ['$scope', '$stateParams', 'Authentication', '$state', 'Slideshows', 'Devices', 'Admin', 'DeviceStatusService', '$uibModal', 'Path', 'ActionResultDialogService', '$timeout', 'DragAndDropItemsArray',
        function ($scope, $stateParams, Authentication, $state, Slideshows, Devices, Admin, DeviceStatusService, $uibModal, Path, ActionResultDialogService, $timeout, DragAndDropItemsArray) {
            var modalInstance,
                playlist,
                lastIndexMovedDuringDragAndDrop,
                dragAndDropItemsArray;

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

            function getCleanedUpDeviceJson(device) {
                var idx;

                var clone = _.cloneDeep($scope.device);
                _.forEach(clone.slideAgregation.playList, function (playListItem) {
                    delete playListItem.$$hashKey;
                    delete playListItem.playerScope;
                });

                return JSON.stringify(clone);
            }

            function initDeviceJson () {
                $scope.deviceJson = getCleanedUpDeviceJson();
            }

            function deviceChanged() {
                return getCleanedUpDeviceJson() !== $scope.deviceJson;
            }

            // Update existing Device
            $scope.update = function () {
                var device = $scope.device;

                if (!device.active) {
                    device.active = false;
                }
                device.$update(function () {
                    ActionResultDialogService.showOkDialog('Save was successful.', $scope, function () {
                        initDeviceStatus();
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

            function initDeviceStatus () {
                $scope.device.status = DeviceStatusService.getStatus($scope.device, $scope.adminConfig);
            }

            // Find existing Device
            $scope.findOne = function () {
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
                    initDeviceStatus();
                    _.forEach(playlist, function (item) {
                        item.dragAndDropId = item.slideShow._id;
                    });
                    initDeviceJson();
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

            $scope.$on('$stateChangeStart', function(event) {
                if (deviceChanged()) {
                    var answer = confirm("The device was changed. Are you sure you want to leave this page?");
                    if (!answer) {
                        event.preventDefault();
                    }
                }
            });

            $scope.$on("slidesLoaded", function(event, slides, slideShowId) {
                var entryIndex = _.findIndex(playlist, function (entry) {
                    return entry.slideShow._id === slideShowId;
                });

                if (entryIndex === -1) {
                    return;
                }
                playlist[entryIndex].numberOfSlides = event.targetScope.numberOfSlides;
            });

            $timeout(function () {
                $scope.$apply();
            });
        }
        ]);
}());
