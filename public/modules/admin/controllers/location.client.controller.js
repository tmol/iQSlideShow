/*global angular, alert*/
(function () {
    'use strict';

    angular.module('admin').controller('LocationController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', '$timeout', 'Devices',
        function ($scope, $stateParams, $location, Authentication, Admin, $timeout, Devices) {
            $scope.authentication = Authentication;
            $scope.locations = [];
            $scope.isLocationNameUnique = function (location) {
                var locationIterated, idx;
                for (idx = 0; idx < $scope.locations.length; idx = idx + 1) {
                    locationIterated = $scope.locations[idx];
                    if (locationIterated !== location && locationIterated.name === location.name) {
                        return false;
                    }
                }
                return true;
            };

            $scope.getLocations = function () {
                Admin.getLocations(function (locations) {
                    $scope.locations = locations;
                });
            };

            $scope.addLocation = function () {
                $scope.locations.push({});
            };

            $scope.isAnyLocationEdited = false;

            $scope.$on('locationEdited', function (event, args) {
                var idx = 0;
                $scope.isAnyLocationEdited = true;
                $timeout(function () {
                    $scope.$apply();
                });
            });

            $scope.$on('locationNotEdited', function (event, args) {
                var idx = 0;
                $scope.isAnyLocationEdited = false;
                $timeout(function () {
                    $scope.$apply();
                });
            });

            $scope.$on('locationDeleted', function (event, args) {
                $scope.getLocations(function () {
                    $scope.$apply();
                });
            });

            $scope.$on('locationAddCanceled', function (event, location) {
                var index = $scope.locations.indexOf(location);

                if (index != -1) {
                    $scope.locations.splice(index, 1);
                }
            });

            $scope.editEnabled = function () {
                return !$scope.isAnyLocationEdited;
            };
        }
    ]);
}());
