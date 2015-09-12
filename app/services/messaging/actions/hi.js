/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        errorHandler = require('../../../controllers/errors.server.controller'),
        Device = mongoose.model('Device');

    module.exports = function (messagingEngine, message) {
        console.log("Handling hi message, deviceId: " + message.deviceId);
        console.log("messagingEngine: " + messagingEngine);

        var storeNewDevice = function (deviceId) {
            var newDevice = new Device({
                deviceId: deviceId,
                active: false,
                location: 'TBD',
                name: 'TBD',
                defaultSlideShowId: null,
                isNew: true
            });
            newDevice.save(function (err) {
                if (err) {
                    console.log('Error during saving new device with id' + deviceId + ', error message: ' + errorHandler.getErrorMessage(err));
                }
            });
        };

        var onFindOne = function (err, device) {
            if (err) {
                throw err;
            }

            var publishAction = function (action, content) {
                content = content || null;
                messagingEngine.publish({
                    action: 'newDeviceSaidHi',
                    deviceId: message.deviceId,
                    content: content
                });
            };

            if (!device) {
                storeNewDevice(message.deviceId);
                publishAction('newDeviceSaidHi');
                return;
            }

            if (!device.active) {
                console.log("inactive device: " + device);
                publishAction('inactiveRegisteredDeviceSaidHi');
                return;
            }

            publishAction('deviceSetup', device);
        };

        Device.findOne({deviceId: message.deviceId}).exec(onFindOne);
    };
}());
