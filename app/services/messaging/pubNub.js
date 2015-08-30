/*global require, exports, console*/

var pubNub;

exports.getInstance = function () {
    'use strict';
    var instance;

    function init(messageReceivedCallback) {

        var pubNub = require("pubnub")({
                ssl           : true,  // <- enable TLS Tunneling over TCP
                publish_key   : "pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45",
                subscribe_key : "sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe"
            }),
            theChannel = 'iQSlideShow';

        pubNub.subscribe({
            channel  : theChannel,
            connect: function () {
                console.log("Pubnub subscribed to " + theChannel + " channel.");
            },
            callback : function (message) {
                messageReceivedCallback(message);
            }
        });

        return {
            publish: function (message) {
                pubNub.publish({
                    channel   : theChannel,
                    message   : message,
                    error     : function (e) {
                        console.log("Failed to publish message: " + message + ", error was: " + e);
                    }
                });
            }
        };
    }

    return {
        init: function (messageReceivedCallback) {
            if (!instance) {
                instance = init(messageReceivedCallback);
            }
            console.log("instance: " + instance + ", instance.publish  = " + instance.publish);
            return instance;
        }
    };
};
