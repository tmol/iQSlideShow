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
        var rememberActualLocationName,
            formatDevicesNamesToCommaSeparatedString,
            keyDownHandler;

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

        scope.deleteLocation = function (event) {
            if (event) {
                event.stopPropagation();
            }

            if (scope.editMode === true) {
                scope.ensureReadOnlyMode();
            }

            if (!scope.location._id) {
                scope.$root.$broadcast('locationAddCanceled', scope.location);
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
                scope.$root.$broadcast('locationDeleted');
            });
        };

        formatDevicesNamesToCommaSeparatedString = function (devices) {
            var res = '',
                device;

            res = devices.map(function (device) {return device.name; }).join(", ");

            return res;
        };

        var keyDownHandler = function (event) {
            if (scope.editMode !== true) {
                return;
            }
            
            switch (event.keyCode) {
                case 13: // enter
                    event.preventDefault();
                    scope.saveLocation();
                    break;

                case 27: // escape
                    event.preventDefault();
                    scope.ensureReadOnlyMode();
                    if (scope.location._id) {
                        scope.location.name = scope.locationNameOriginalValue;
                    } else {
                        scope.$root.$broadcast('locationAddCanceled', scope.location);
                    }
                    break;
            }
        };

        element.on('keydown', keyDownHandler);

        scope.$on("$destroy", function () {
            element.off('keydown', keyDownHandler);
        });

        scope.editMode = false;
        rememberActualLocationName();

        if (!scope.location._id) {
            scope.editMode = true;
            scope.$root.$broadcast('locationEdited');
        }

        scope.saveLocation = function (event) {
            var adminService = new Admin(scope.location);
            
            if (event) {
                event.stopPropagation();
            }

            if (scope.editMode !== true) {
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
                scope.ensureReadOnlyMode();
                return;
            }

            if (scope.location._id) {
                Devices.getByLocationName({ locationName: scope.locationNameOriginalValue }, function (devices) {
                    if (devices.length !== 0) {
                        var msg = 'There are devices attached to the location. Please confirm that the devices locations will be updated. The attached devices: ' + formatDevicesNamesToCommaSeparatedString(devices);
                        if (confirm(msg) === false) {
                            scope.ensureReadOnlyMode();
                            return;
                        }
                    }

                    adminService.$updateLocation(function () {
                        rememberActualLocationName();
                        scope.ensureReadOnlyMode();
                    });
                });
            } else {
                adminService.$saveLocation(function (savedLocation) {
                    scope.location._id = savedLocation._id;
                    rememberActualLocationName();
                    scope.ensureReadOnlyMode();
                });
            }
        };
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
