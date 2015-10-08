/*global angular, alert*/
/*jslint nomen: true*/
angular.module('admin').directive('locationItem', ['Admin', '$document', function (Admin, $document) {
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
                scope.$apply();
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

        scope.delete = function () {
            var adminService = new Admin(scope.location);
            adminService.$deleteLocation();
            scope.$root.$broadcast('locationDeleted');
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