/*jslint nomen: true, vars: true, unparam: true*/
/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('ServerMessageBroker', ['$http', 'MessagingEngineFactory', 'AppVersionService', '$rootScope',
        function ($http, MessagingEngineFactory, AppVersionService, $rootScope) {
            return function () {
                var messageHandler = {};
                var messagingEngine = MessagingEngineFactory.getEngine();
                var messageEventUnBind = null;

                this.sendHiMessage = function (deviceId) {
                    var message = {
                        action: "hi",
                        deviceId: deviceId,
                        appVersion: AppVersionService.getVersion()
                    };
                    return $http.post("/message", message);
                };
                this.publishSlideShow = function (slideShowId) {
                    var message = {
                        action: "publishSlideShow",
                        slideShowId: slideShowId,
                        appVersion: AppVersionService.getVersion()
                    };
                    return $http.post("/message", message);
                };
                this.onNewDeviceSaidHi = function (callback) {
                    messageHandler.newDeviceSaidHi = callback;
                };
                this.subscribe = function (callback) {
                    //todo: extract the subscription because it duplicates the subscription inside DeviceMessageBroker
                    messageEventUnBind = $rootScope.$on(messagingEngine.serverChannelMessageEvent, function (event, payload) {
                        var message = payload.message;
                        if (!messageHandler[message.action]) {
                            return;
                        }
                        messageHandler[message.action](message);
                    });

                    messagingEngine.subscribeToServerChannel(function () {
                        if (callback) {
                            callback();
                        }
                    });
                };
                this.unSubscribe = function () {
                    messageEventUnBind();
                };
            };
        }]);
}());
