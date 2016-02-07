/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('SelectDevicesController', ['$scope', '$stateParams', 'Slideshows',
        function ($scope, $stateParams, Slideshows) {
            $scope.displayAll = true;
            $scope.search = function () {
                var nameFilter = $scope.displayAll ? '' : $scope.filter;
                $scope.devices = Slideshows.getDevices({
                    slideshowId: $stateParams.slideshowId
                }, {name: nameFilter});
            };

            $scope.save = function () {
                var selectedDevices = $scope.devices.filter(function (device) {
                    return device.checked;
                });
                Slideshows.setDevices({slideshowId: $stateParams.slideshowId}, selectedDevices)
                    .$promise.then(function () {
                        $scope.onPlayedOnDevicesSaved();
                        $scope.$close();
                    });
            };

            $scope.$on('devicesToPlayOnDivScrollBarVisible', function () {
               $scope.scrollBarVisibleInDevicesList = true;
            });

            $scope.$watch('displayAll', function () {
                $scope.search();
            });

            $scope.$watch('filter', function () {
                $scope.search();
            });

            $scope.search();
        }]);
}());
