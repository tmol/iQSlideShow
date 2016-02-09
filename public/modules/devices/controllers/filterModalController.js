/*jslint nomen: true*/
/*global angular, _*/
(function () {
    'use strict';
    angular.module('devices').controller('DeviceFilterModalController', ['$scope', '$uibModalInstance', '$state', 'filterParameters', 'locations', function ($scope, $uibModalInstance, $state, filterParameters, locations) {
        var selectedForFilter;

        $scope.filterParameters = filterParameters;
        $scope.locations = locations;
        $scope.items = [];

        locations.forEach(function (location) {
            selectedForFilter = filterParameters.filterItems && _.includes(filterParameters.filterItems, location.name);
            $scope.items.push({ name: location.name, selectedForFilter: selectedForFilter });
        });

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.filter = function () {
            $scope.filterParameters.filterItems = [];
            $scope.items.forEach(function (item) {
                if (item.selectedForFilter === true) {
                    $scope.filterParameters.filterItems.push(item.name);
                }
            });
            $scope.$root.$broadcast('filterDevices');
            $uibModalInstance.close();
        };
    }]);
}());
