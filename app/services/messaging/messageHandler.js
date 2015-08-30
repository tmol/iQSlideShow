/*global require, exports, console*/
(function () {
    'use strict';

    var messagingEngineFactory = require('./messagingEngineFactory'),
        mongoose = require('mongoose'),
        errorHandler = require('../../controllers/errors.server.controller'),
        Device = mongoose.model('Device'),
        messagingEngine,
        messageHandler = {
            messagingEngine: null,

            hi: function (message) {
                console.log("Handling hi message, deviceId: " + message.deviceId);
                console.log("messagingEngine: " + messagingEngine);
                Device.findOne({deviceId: message.deviceId}).exec(function (err, device) {
                    if (err) {
                        throw err;
                    }
                    if (!device) {
                        device = new Device({
                            deviceId: message.deviceId,
                            active: false,
                            location: 'TBD',
                            name: 'TBD',
                            defaultSlideShowId: null
                        });
                        device.save(function (err) {
                            if (err) {
                                console.log('Error during saving new device with id' + message.deviceId + ', error message: ' + errorHandler.getErrorMessage(err));
                            }
                        });
                        messagingEngine.publish({
                            action: 'newDeviceSaidHi',
                            deviceId: message.deviceId
                        });
                    } else {
                        if (!device.active) {
                            messagingEngine.publish({
                                action: 'inactiveRegisteredDeviceSaidHi',
                                deviceId: message.deviceId
                            });
                        } else {
                            messagingEngine.publish({
                                action: 'deviceSetup',
                                deviceId: message.deviceId,
                                content: device
                            });
                        }
                    }
                });
            }
        };

    function receiveMessage(message) {
        console.log("Message received with action: " + message.action);

        if (messageHandler[message.action]) {
            console.log('messageHandler.messagingEngine = ' + messageHandler.messagingEngine);
            messageHandler[message.action](message);
        }
    }

    exports.init = function () {
        messagingEngine = messagingEngineFactory.init(receiveMessage);
        messageHandler.messagingEngine = messagingEngine;
        console.log('messagingEngine ' + messagingEngine);
    };
}());
