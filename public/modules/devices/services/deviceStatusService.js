/*global angular, _*/
(function () {
    'use strict';

    angular.module('devices').service('DeviceStatusService',
        function () {

            var getStatus = function (device, adminConfig) {
                if (!device.lastHealthReport) {
                    return 'unhealthy';
                }

                var lastHeathReport = new Date(device.lastHealthReport),
                    minutesPassedSinceLastHealthReport = (new Date().getTime() - lastHeathReport.getTime()) / (1000 * 60);
                if (minutesPassedSinceLastHealthReport > adminConfig.nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathy) {
                    return 'unhealthy';
                }

                return device.active ? 'active' : 'inactive';
            };

            return {
                getStatus: getStatus
            };
        });
}());
