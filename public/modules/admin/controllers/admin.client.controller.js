/*global angular*/
(function () {
    'use strict';

    angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'Slideshows',
        function ($scope, $stateParams, $location, Authentication, Admin, Slideshows) {
            $scope.authentication = Authentication;

            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            $scope.update = function () {
                var config = $scope.config;

                config.$updateConfig(function () {
                    $location.path('/');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.gridOptionsLocations = {
                enableSorting: true,
                columnDefs: [
                    { name: 'location', enableCellEdit: true, enableCellEditOnFocus: true  }
                ]
            };

            $scope.gridOptionsLocations.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;

                $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    alert(newValue);
                });
            };

            $scope.getConfig = function () {
                Admin.getConfig(function (config) {
                    $scope.config = config;
                    $scope.gridOptionsLocations.data = $scope.config.locations;
                });
            };


            $scope.addLocation = function () {
                $scope.config.locations.push({location: 'New location'});
            };
        }
                                                          ]);

}());
