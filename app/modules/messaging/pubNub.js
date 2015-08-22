var pubNub;

exports.init = function (channelName, messageReceivedCallback) {
    'use strict';
    pubNub = require("pubnub")({
        ssl           : true,  // <- enable TLS Tunneling over TCP
        publish_key   : "pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45",
        subscribe_key : "sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe"
    });

    pubNub.subscribe({
        channel  : channelName,
        connect: function () {
            console.log("Pubnub subscribed to " + channelName + " channel.");
        },
        callback : function (message) {
            messageReceivedCallback(message);
        }
    });
};
