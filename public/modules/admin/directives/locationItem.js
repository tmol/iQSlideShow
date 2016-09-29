/*global angular, alert, confirm*/
/*jslint nomen: true, es5: true */
angular.module('admin').directive('locationItem', ['Admin', '$document', '$timeout', 'Devices', 'ActionResultDialogService', function (Admin, $document, $timeout, Devices, ActionResultDialogService) {
    'use strict';

    var template = '<div class="location-item" ng-click="editLocation()">';
    template += '<span class="location-item-name" ng-show="!editMode">{{location.name}}</span>';
    template += '<input class="location-item-edit" type="text" placeholder="New location" ng-show="editMode" ng-model="location.name" focus-on="editMode" select-on="editMode" />';
    template += '<span class="location-item-save" ng-click="saveLocation($event)" ng-show="editMode"></span>';
    template += '<span class="location-item-delete" ng-click="deleteLocation($event)"></span>';
    template += '</div>'

    function link(scope, element, attrs) {
        var ensureReadOnlyMode = function () {
            if (scope.editMode) {
                scope.editMode = false;
                scope.$emit('locationNotEdited');
            }
        };

        var rememberActualLocationName = function () {
            scope.locationNameOriginalValue = scope.location.name;
        };

        var formatDevicesNamesToCommaSeparatedString = function (devices) {
            var res = '',
                device;

            res = devices.map(function (device) {return device.name; }).join(", ");

            return res;
        };

        scope.editMode = false;
        rememberActualLocationName();

        if (!scope.location._id) {
            scope.editMode = true;
            scope.$emit('locationEdited');
        }

        scope.editLocation = function () {
            if (!scope.editEnabled()) {
                return;
            }

            if (!scope.editMode) {
                scope.editMode = true;
                scope.$emit('locationEdited');
                $timeout(function () {
                    scope.$apply();
                });
            }
        };

        scope.deleteLocation = function (event) {
            if (event) {
                event.stopPropagation();
            }

            if (scope.editMode) {
                ensureReadOnlyMode();
            }

            if (!scope.location._id) {
                scope.$emit('locationAddCanceled', scope.location);
                return;
            }

            Devices.getByLocationName({locationName: scope.location.name}, function (devices) {
                var msg,
                    adminService;

                if (devices.length > 0) {
                    msg = 'Delete is not allowed because the devices from below are attached to the location. Please change the location of the devices.\r\n' + formatDevicesNamesToCommaSeparatedString(devices);
                    alert(msg);
                    return;
                }

                adminService = new Admin(scope.location);
                adminService.$deleteLocation();
                scope.$emit('locationDeleted');
            });
        };

        scope.saveLocation = function (event) {
            var adminService = new Admin(scope.location);
            
            if (event) {
                event.stopPropagation();
            }

            if (!scope.editMode) {
                return;
            }

            if (!scope.location.name) {
                ActionResultDialogService.showOkDialog('The location must have a name!', scope);
                return;
            }

            if (!scope.isLocationNameUnique({location: scope.location})) {
                ActionResultDialogService.showOkDialog('The location name must be unique!', scope);
                return;
            }

            if (scope.locationNameOriginalValue === scope.location.name) {
                ensureReadOnlyMode();
                return;
            }

            if (scope.location._id) {
                Devices.getByLocationName({ locationName: scope.locationNameOriginalValue }, function (devices) {
                    if (devices.length !== 0) {
                        var msg = 'There are devices attached to the location. Please confirm that the devices locations will be updated. The attached devices: ' + formatDevicesNamesToCommaSeparatedString(devices);
                        if (confirm(msg) === false) {
                            ensureReadOnlyMode();
                            return;
                        }
                    }

                    adminService.$updateLocation(function () {
                        rememberActualLocationName();
                        ensureReadOnlyMode();
                    });
                });
            } else {
                adminService.$saveLocation(function (savedLocation) {
                    scope.location._id = savedLocation._id;
                    rememberActualLocationName();
                    ensureReadOnlyMode();
                });
            }
        };

        var keyDownHandler = function (event) {
            if (!scope.editMode) {
                return;
            }
            
            switch (event.keyCode) {
                case 13: // enter
                    event.preventDefault();
                    scope.saveLocation();
                    break;

                case 27: // escape
                    event.preventDefault();
                    ensureReadOnlyMode();
                    if (scope.location._id) {
                        scope.location.name = scope.locationNameOriginalValue;
                    } else {
                        scope.$emit('locationAddCanceled', scope.location);
                    }
                    break;
            }
        };

        element.on('keydown', keyDownHandler);

        scope.$on("$destroy", function () {
            element.off('keydown', keyDownHandler);
        });
    }

    return {
        restrict: 'A',
        link: link,
        transclude: true,
        template: template,
        scope: {
            location: '=',
            isLocationNameUnique: '&',
            editEnabled: '&'
        }
    };
}]);
