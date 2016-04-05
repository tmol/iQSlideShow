/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';

    // Devices controller
    angular.module('devices').controller('DevicesEditController', ['$scope', '$stateParams', 'Authentication', '$state', 'Slideshows', 'Devices', 'Admin', 'DeviceStatusService', '$uibModal', 'Path', 'ActionResultDialogService',
        function ($scope, $stateParams, Authentication, $state, Slideshows, Devices, Admin, DeviceStatusService, $uibModal, Path, ActionResultDialogService) {
            var modalInstance;

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

            // Update existing Device
            $scope.update = function () {
                var device = $scope.device;

                if (!device.active) {
                    device.active = false;
                }
                device.$update(function () {
                    ActionResultDialogService.showOkDialog('Save was successful.', $scope);
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
                    _.forEach($scope.device.slideAgregation.playList, function (item) {
                        item.dragAndDropId = item.slideShow._id;
                    });
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
                        $scope.device.slideAgregation.playList.push({
                            slideShow : selectedSlideShow,
                            dragAndDropId: selectedSlideShow._id
                        });
                    });
                });
            };

            $scope.removeSlideshow = function (slideShow) {
                var index = $scope.device.slideAgregation.playList.indexOf(slideShow);
                $scope.device.slideAgregation.playList.splice(index, 1);
            };

            $scope.navigateToEdit = function (slideshowId) {
                $state.go('editSlideshow', {slideshowId: slideshowId});
            };

            var moveSlideShowInPlaylist = function (slideShow, placesToMove) {
                var playList = $scope.device.slideAgregation.playList,
                    index = playList.indexOf(slideShow),
                    newIndex = index + placesToMove;

                if (newIndex < 0 || newIndex > playList.length - 1) {
                    return;
                }

                playList.splice(index, 1);
                playList.splice(newIndex, 0, slideShow);
            };

            $scope.moveSlideShowLeft = function (playListEntry) {
                moveSlideShowInPlaylist(playListEntry, -1);
            };

            $scope.moveSlideShowRight = function (playListEntry) {
                moveSlideShowInPlaylist(playListEntry, 1);
            };

            $scope.getDraggableItemsArray = function () {
                return $scope.device.slideAgregation.playList;
            };

            $scope.$on('currentSlideChanged', function (event, currentIndex, slideShowId) {
                var entryIndex = _.findIndex($scope.device.slideAgregation.playList, function (entry) {
                    return entry.slideShow._id === slideShowId;
                });

                if (entryIndex === -1) {
                    return;
                }
                $scope.device.slideAgregation.playList[entryIndex].currentSlideNr = currentIndex + 1;
            });
        }
        ]);
}());
