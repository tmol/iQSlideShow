/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('ServerMessaging', ['$http','AppVersionService',
        function ($http, AppVersionService) {
            return {
                sendHiMessage : function (deviceId) {
                    var message = {
                        action: "hi",
                        deviceId: deviceId,
                        appVersion: AppVersionService.getVersion()
                    };
                    return $http.post("/message", message);
                }
            }
        }]);
}());
