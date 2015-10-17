/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';
    angular.module('devices').controller('DeviceFilterModalController', ['$scope', '$modalInstance', '$state', 'filterParameters', 'locations', function ($scope, $modalInstance, $state, filterParameters, locations) {
        var selectedForFilter;

        $scope.filterParameters = filterParameters;
        $scope.locations = locations;
        $scope.items = [];

        locations.forEach(function (location) {
            selectedForFilter = filterParameters.locations && _.includes(filterParameters.locations, location.name);
            $scope.items.push({ name: location.name, selectedForFilter: selectedForFilter });
        });

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.filter = function () {
            $scope.filterParameters.locations = [];
            $scope.items.forEach(function (item) {
                if (item.selectedForFilter === true) {
                    $scope.filterParameters.locations.push(item.name);
                }
            });
            $scope.$root.$broadcast('filterDevices');
            $modalInstance.close();
        };
    }]);
}());
