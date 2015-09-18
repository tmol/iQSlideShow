/*global angular, PUBNUB, console*/
(function () {
    'use strict';
    angular.module('core').service('PubNubFacade', ['PubNub',
        function (PubNub) {
            var instance,
                pubNub = PubNub;

            function publishToChannel(channelName, action, deviceId, content) {
                content = content || {};
                pubNub.ngPublish({
                    channel: channelName,
                    message: {
                        action : action,
                        deviceId  : deviceId,
                        content : content
                    }
                });
            }

            function init() {

                var theServerChannel = 'iQSlideShow';

                PubNub.init({
                    publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
                    subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
                    uuid : PUBNUB.unique(),
                    ssl : true
                });

                return {

                    serverChannelMessageEvent: pubNub.ngMsgEv(theServerChannel),

                    getDeviceChannelMessageEvent: function (deviceId) {
                        return pubNub.ngMsgEv(deviceId);
                    },

                    subscribeToServerChannel : function () {
                        pubNub.ngSubscribe({ channel: theServerChannel});
                    },

                    subscribeToDeviceChannel : function (deviceId) {
                        pubNub.ngSubscribe({ channel: deviceId});
                    },

                    publishToServerChannel : function (action, deviceId, content) {
                        publishToChannel(theServerChannel, action, deviceId, content);
                    },

                    publishToDeviceChannel : function (action, deviceId, content) {
                        publishToChannel(deviceId, action, deviceId, content);
                    }
                };
            }

            return {
                getInstance: function (PubNub, deviceId) {
                    if (!instance) {
                        instance = init(PubNub, deviceId);
                    }

                    return instance;
                }
            };
        }
        ]);
}());
