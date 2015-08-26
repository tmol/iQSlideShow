/*global angular*/
(function () {
    'use strict';

    //Devices service used to communicate Devices REST endpoints
    angular.module('player').factory('MessagingEngineFactory', ['PubNub',
        function (PubNub) {
            return {
                getEngine : function (deviceId) {
                    return pubNubEngine.getInstance(PubNub, deviceId);
                }
            };
        }]);
}());