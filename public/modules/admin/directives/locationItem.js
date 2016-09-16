/*global angular, alert, confirm*/
/*jslint nomen: true, es5: true */
angular.module('admin').directive('locationItem', ['Admin', '$document', '$timeout', 'Devices', 'ActionResultDialogService', function (Admin, $document, $timeout, Devices, ActionResultDialogService) {
    'use strict';

    var template = '';
    template += '<span class="location-item-name" ng-show="!editMode" ng-click="editLocation()">{{location.name}}</span>';
    template += '<input class="location-item-edit" type="text" placeholder="New location" ng-show="editMode" ng-model="location.name" focus-on="editMode" select-on="editMode" />';
    template += '<span class="location-item-delete" ng-click="deleteLocation()">delete</span>';

    function link(scope, element, attrs) {
        var rememberActualLocationName,
            formatDevicesNamesToCommaSeparatedString,
            focusOutHanlder,
            keyPressHandler;

        scope.getEditMode = function () {
            return scope.editMode;
        };

        rememberActualLocationName = function () {
            scope.locationNameOriginalValue = scope.location.name;
        };

        scope.editLocation = function () {
            if (!scope.editEnabled()) {
                return;
            }

            if (scope.editMode === false) {
                scope.editMode = true;
                scope.$root.$broadcast('locationEdited');
                $timeout(function () {
                    scope.$apply();
                });
            }
        };

        scope.ensureReadOnlyMode = function () {
            if (scope.editMode === true) {
                scope.editMode = false;
                scope.$root.$broadcast('locationNotEdited');
            }
        };

        scope.deleteLocation = function () {
            if (scope.editMode === true) {
                scope.ensureReadOnlyMode();
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
                scope.$root.$broadcast('locationDeleted');
            });
        };

        formatDevicesNamesToCommaSeparatedString = function (devices) {
            var res = '',
                device;

            res = devices.map(function (device) {return device.name; }).join(", ");

            return res;
        };
        keyPressHandler = function (event) {
            if (event.keyCode == 13) {
                focusOutHanlder();
            }
        }
        focusOutHanlder = function (event) {
            var adminService,
                isThereAtLeastOnDeviceAttachedToLocation,
                msg,
                confirmationResult;

            if (scope.editMode !== true) {
                return;
            }

            if (!scope.location.name) {
                if (scope.locationNameOriginalValue) {
                    scope.location.name = scope.locationNameOriginalValue;

                    ActionResultDialogService.showOkDialog('The location must have a name!', scope);
                } else {
                    scope.$root.$broadcast('locationAddCanceled', scope.location);
                }

                scope.ensureReadOnlyMode();
                return;
            }

            if (!scope.isLocationNameUnique({location: scope.location})) {
                ActionResultDialogService.showOkDialog('The location name must be unique!', scope);
                scope.location.name = scope.locationNameOriginalValue;
                scope.ensureReadOnlyMode();
                return;
            }

            if (scope.locationNameOriginalValue === scope.location.name) {
                scope.ensureReadOnlyMode();
                return;
            }

            Devices.getByLocationName({locationName: scope.locationNameOriginalValue}, function (devices) {
                adminService = new Admin(scope.location);
                isThereAtLeastOnDeviceAttachedToLocation = devices.length > 0;

                if (scope.location._id) {
                    if (isThereAtLeastOnDeviceAttachedToLocation === true) {
                        msg = 'There are devices attached to the location. Please confirm that the devices locations will be updated. The attached devices: ' + formatDevicesNamesToCommaSeparatedString(devices);
                        if (confirm(msg) === false) {
                            scope.ensureReadOnlyMode();
                            return;
                        }
                    }
                    adminService.$updateLocation(function () {
                        rememberActualLocationName();
                        scope.ensureReadOnlyMode();
                    });
                } else {
                    adminService.$saveLocation(function (savedLocation) {
                        scope.location._id = savedLocation._id;
                        rememberActualLocationName();
                        scope.ensureReadOnlyMode();
                    });
                }
            });
        };

        element.on('focusout', focusOutHanlder);

        element.on('keypress', keyPressHandler);


        scope.$on("$destroy", function () {
            element.off('focusout', focusOutHanlder);
            element.off('keyPress', keyPressHandler);

        });

        rememberActualLocationName();
        scope.editMode = false;
        if (scope.location._id === undefined) {
            // just added
            scope.editMode = true;
            element[0].focus();
            scope.$root.$broadcast('locationEdited');
        }
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
