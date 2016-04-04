/*global angular, alert, confirm*/
/*jslint nomen: true, es5: true */
angular.module('admin').directive('locationItem', ['Admin', '$document', '$timeout', 'Devices', 'ActionResultDialogService', function (Admin, $document, $timeout, Devices, ActionResultDialogService) {
    'use strict';
    function link(scope, element, attrs) {
        var rememberActualLocationName,
            formatDevicesNamesToCommaSeparatedString,
            focusOutHanlder;

        scope.getEditMode = function () {
            return scope.editMode;
        };

        rememberActualLocationName = function () {
            scope.locationNameOriginalValue = scope.location.name;
        };

        scope.onClickReadOnlyArea = function () {
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

        scope.delete = function () {
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

        focusOutHanlder = function (event) {
            var adminService,
                isThereAtLeastOnDeviceAttachedToLocation,
                msg,
                confirmationResult;

            if (!scope.isLocationNameUnique({location: scope.location})) {
                ActionResultDialogService.showOkDialog('Location name must ne unique!', scope);
                return;
            }

            if (scope.locationNameOriginalValue === scope.location.name) {
                scope.ensureReadOnlyMode();
                return;
            }

            if (scope.editMode !== true) {
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
            }
                                     );
        };

        element.on('focusout', focusOutHanlder);


        scope.$on("$destroy", function () {
            element.off('focusout', focusOutHanlder);
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
        templateUrl: 'modules/admin/templates/locationItem.html',
        scope: {
            location: '=',
            isLocationNameUnique: '&',
            editEnabled: '&'
        }
    };
}]);
