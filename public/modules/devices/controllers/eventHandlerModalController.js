/*global angular*/
(function () {
    'use strict';
    angular.module('devices').controller('EventHandlerModalController', ['$scope', '$modalInstance', '$state', 'deviceEvent', function ($scope, $modalInstance, $state, deviceEvent) {
        $scope.deviceEvent = deviceEvent;

        $scope.editDevice = function () {
            $state.go('editDevice', {deviceId: deviceEvent.deviceId});
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
}());
