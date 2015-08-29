/*global require, exports, console*/
(function () {
    'use strict';

    var messagingEngineFactory = require('./messagingEngineFactory'),
        messageHandler = {

            hi: function (message) {
                console.log("Handling hi message, deviceId: " + message.deviceId);
            }
        };

    function receiveMessage(message) {
        console.log("Message received with action: " + message.action);

        if (messageHandler[message.action]) {
            messageHandler[message.action](message);
        }
    }

    exports.init = function () {
        messagingEngineFactory.init(receiveMessage);
    };
}());
