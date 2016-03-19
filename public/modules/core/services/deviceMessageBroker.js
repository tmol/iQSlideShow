/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, console*/
(function () {
    'use strict';
    angular.module('core').service('DeviceMessageBroker', ['MessagingEngineFactory', '$rootScope',
        function (MessagingEngineFactory, $rootScope) {
            return function (deviceId) {
                var self = this;
                var messageHandler = {};
                self.deviceId = deviceId;
                var messagingEngine = MessagingEngineFactory.getEngine();
                var messageEventUnBind = null;

                this.sendSwitchSlide = function (slideShowId, slideShowName,  minutesToPlayBeforeGoingBackToDefaultSlideShow) {
                    messagingEngine.publishToDeviceChannel('switchSlide', self.deviceId, {
                        slideShowIdToPlay: slideShowId,
                        slideShowName: slideShowName,
                        minutesToPlayBeforeGoingBackToDefaultSlideShow : minutesToPlayBeforeGoingBackToDefaultSlideShow
                    });
                };
                this.sendMoveSlideLeft = function () {
                    messagingEngine.publishToDeviceChannel('moveSlideLeft', self.deviceId);
                };
                this.sendMoveSlideRight = function () {
                    messagingEngine.publishToDeviceChannel('moveSlideRight', self.deviceId);
                };
                this.sendHoldSlideShow = function () {
                    messagingEngine.publishToDeviceChannel('holdSlideShow', self.deviceId);
                };
                this.sendResetSlideShow = function () {
                    messagingEngine.publishToDeviceChannel('resetSlideShow', self.deviceId);
                };
                this.sendSlideShowClicked = function (position) {
                    messagingEngine.publishToDeviceChannel('slideShowClicked', self.deviceId, position);
                };
                this.sendPresence = function (position) {
                    messagingEngine.publishToDeviceChannel('deviceInteractionIsPresent', self.deviceId);
                };
                this.onDeviceInteractionIsPresent = function (callback) {
                    messageHandler.deviceInteractionIsPresent = callback;
                };
                this.onMoveSlideRight = function (callback) {
                    messageHandler.moveSlideRight = callback;
                };
                this.onMoveSlideLeft = function (callback) {
                    messageHandler.moveSlideLeft = callback;
                };
                this.onSwitchSlide = function (callback) {
                    messageHandler.switchSlide = callback;
                };
                this.onDeviceSetup = function (callback) {
                    messageHandler.deviceSetup = callback;
                };
                this.onHoldSlideShow = function (callback) {
                    messageHandler.holdSlideShow = callback;
                };
                this.onResetSlideShow = function (callback) {
                    messageHandler.resetSlideShow = callback;
                };
                this.onInactiveRegisteredDeviceSaidHi = function (callback) {
                    messageHandler.inactiveRegisteredDeviceSaidHi = callback;
                };
                this.onReload = function (callback) {
                    messageHandler.reload = callback;
                };
                this.onSlideShowClicked = function (callback) {
                    messageHandler.slideShowClicked = callback;
                };
                this.unSubscribe = function () {
                    messageEventUnBind();
                    messagingEngine.unSubscribeFromDevice(self.deviceId);
                };
                this.subscribe = function (callback) {
                    //todo: extract the subscription because it duplicates the subscription inside ServerMessageBroker
                    messageEventUnBind = $rootScope.$on(messagingEngine.getDeviceChannelMessageEvent(self.deviceId), function (event, payload) {
                        var message = payload.message;
                        if (!messageHandler[message.action]) {
                            return;
                        }
                        messageHandler[message.action](message);
                    });

                    messagingEngine.subscribeToDeviceChannel(self.deviceId, function () {
                        if (callback) {
                            callback();
                        }
                    });
                };
            };
        }]);
}());
