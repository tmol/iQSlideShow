/*jslint nomen: true, vars: true, unparam: true*/
/*global angular, PUBNUB, console*/
(function () {
    'use strict';
    angular.module('core').service('PubNubFacade', ['$rootScope', 'AppVersionService',
        function ($rootScope, AppVersionService) {
            var instance;
            var pubnub;
            function publishToChannel(channelName, action, deviceId, content, callback) {
                if (content == undefined || content == null) {
                    content = {};
                }
                pubnub.publish({
                    channel: channelName,
                    message: {
                        action : action,
                        deviceId  : deviceId,
                        appVersion: AppVersionService.getVersion(),
                        content : content
                    },
                    callback: callback
                });
            }

            function init() {

                var theServerChannel = serverChannelName;

                pubnub = PUBNUB({
                    publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
                    subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
                    uuid : PUBNUB.unique(),
                    ssl : true
                });

                var getMessageEvent = function (channel) {
                    return "pubnub:" + channel;
                };

                var getBroadCastFunction = function (channelName) {
                    return function (message, env, channel) {
                        $rootScope.$broadcast(getMessageEvent(channelName), {
                            message: message,
                            ev: env,
                            channel: channel
                        });
                    };
                };

                return {

                    serverChannelMessageEvent: getMessageEvent(theServerChannel),

                    getDeviceChannelMessageEvent: function (deviceId) {
                        return getMessageEvent(deviceId);
                    },

                    subscribeToServerChannel : function (onConnect) {
                        pubnub.subscribe({
                            channel: theServerChannel,
                            message: getBroadCastFunction(theServerChannel),
                            connect: onConnect
                        });
                    },

                    subscribeToDeviceChannel : function (deviceId, onConnect) {
                        pubnub.subscribe({
                            channel: deviceId,
                            message: getBroadCastFunction(deviceId),
                            connect:  onConnect
                        });
                    },
                    publishToServerChannel : function (action, deviceId, content, callback) {
                        publishToChannel(theServerChannel, action, deviceId, content, callback);
                    },

                    publishToDeviceChannel : function (action, deviceId, content, callback) {
                        publishToChannel(deviceId, action, deviceId, content, callback);
                    },

                    unSubscribeFromDevice : function (deviceId) {
                        pubnub.unsubscribe({
                            channel: deviceId
                        });
                    },

                    unSubscribeFromServer : function () {
                        pubnub.unsubscribe({
                            channel: theServerChannel
                        });
                    }
                };
            }

            return {
                getInstance: function () {
                    if (!instance) {
                        instance = init();
                    }

                    return instance;
                }
            };
        }
        ]);
}());
