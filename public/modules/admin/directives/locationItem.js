/*global angular, alert*/
angular.module('admin').directive('locationItem', function () {
    'use strict';
    function link(scope, element, attrs) {
        scope.editMode = true;
        element[0].focus();

        scope.getEditMode = function () {
            return scope.editMode;
        };

        element.on('mousedown', function (event) {
            if (!scope.editEnabled()) {
                return;
            }

            if (scope.editMode === false) {
                scope.editMode = true;
                scope.$root.$broadcast('locationEdited');
                scope.$apply();
            }
        });

        element.on('focusout', function (event) {
            var locationIsUnique = scope.isLocationNameUnique({locationName: scope.location.name});
            if (!scope.isLocationNameUnique({location: scope.location})) {
                alert('Location name must ne unique!');
                return;
            }
            if (scope.editMode === true) {
                scope.editMode = false;
                scope.$root.$broadcast('locationNotEdited');
                scope.$apply();
            }
        });

        scope.$root.$broadcast('locationEdited');
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
});