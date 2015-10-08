/*global angular, alert*/
/*jslint nomen: true*/
angular.module('admin').directive('locationItem', ['Admin', '$document', '$timeout', 'Devices', function (Admin, $document, $timeout, Devices) {
    'use strict';
    function link(scope, element, attrs) {
        scope.getEditMode = function () {
            return scope.editMode;
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

        scope.leaveEditMode = function () {
            scope.editMode = false;
            scope.$root.$broadcast('locationNotEdited');
        };

        element.on('focusout', function (event) {
            var adminService,
                locationIsUnique = scope.isLocationNameUnique({locationName: scope.location.name});
            if (!scope.isLocationNameUnique({location: scope.location})) {
                alert('Location name must ne unique!');
                return;
            }
            if (scope.editMode === true) {
                adminService = new Admin(scope.location);
                if (scope.location._id) {
                    adminService.$updateLocation(function () {
                        scope.leaveEditMode();
                    });
                } else {
                    adminService.$saveLocation(function (savedLocation) {
                        scope.location._id = savedLocation._id;
                        scope.leaveEditMode();
                    });
                }
            }
        });

        var formatDevicesNamesInString = function (devices) {
            var res = '',
                device;

            devices.forEach(function (device) {
                if (res.length > 0) {
                    res = res + ', ';
                }
                res = res + device.name;
            });

            return res;
        };

        scope.delete = function () {
            if (scope.editMode === true) {
                scope.leaveEditMode();
            }

            Devices.getByLocationName({locationName: scope.location.name}, function (devices) {
                var msg,
                    adminService;

                if (devices.length > 0) {
                    msg = 'Delete is not allowed because the devices from below are attached to the location. Please change the location of the devices.\r\n' + formatDevicesNamesInString(devices);
                    alert(msg);
                    return;
                }

                adminService = new Admin(scope.location);
                adminService.$deleteLocation();
                scope.$root.$broadcast('locationDeleted');
            });
        };

        scope.editMode = false;
        if (scope.location._id === undefined) {
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