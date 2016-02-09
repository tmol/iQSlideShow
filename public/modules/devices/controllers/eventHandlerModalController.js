/*global angular*/
(function () {
    'use strict';
    angular.module('devices').controller('EventHandlerModalController', ['$scope', '$uibModalInstance', '$state', 'deviceEvent', function ($scope, $uibModalInstance, $state, deviceEvent) {
        $scope.deviceEvent = deviceEvent;

        $scope.editDevice = function () {
            $state.go('editDevice', {deviceId: deviceEvent.deviceId});
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
}());
