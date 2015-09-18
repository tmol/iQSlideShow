/*global require, exports, console*/

var pubNub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : "pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45",
    subscribe_key : "sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe"
}), theChannel = 'iQSlideShow';

exports.getInstance = function () {
    'use strict';
    var instance;

    function publishMessage(channelName, message) {
        pubNub.publish({
            channel   : channelName,
            message   : message,
            error     : function (e) {
                console.log("Failed to publish to channel:" + channelName + ", message: " + message + ", error was: " + e);
            }
        });
    }

    function publishToDeviceChannel(deviceId, message) {
        publishMessage(deviceId, message);
    }

    function publishToServerChannel(message) {
        publishMessage(theChannel, message);
    }

    function subscribe(channelName, callback) {
        pubNub.subscribe({
            channel  : channelName,
            connect: function () {
                console.log("Pubnub subscribed to " + theChannel + " channel.");
            },
            callback: callback
        });
    }

    function subscribeToDeviceChannel(deviceId, callback) {
        subscribe(deviceId);
    }

    function subscribeToServerChannel(callback) {
        subscribe(theChannel, callback);
    }

    function init() {
        return {
            publishToServerChannel: publishToServerChannel,
            publishToDeviceChannel: publishToDeviceChannel,
            subscribeToDeviceChannel: subscribeToDeviceChannel,
            subscribeToServerChannel: subscribeToServerChannel
        };
    }

    return {
        init: function (messageReceivedCallback) {
            if (!instance) {
                instance = init(messageReceivedCallback);
            }
            return instance;
        }
    };
};
