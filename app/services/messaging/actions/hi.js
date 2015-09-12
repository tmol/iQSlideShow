/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        errorHandler = require('../../../controllers/errors.server.controller'),
        Device = mongoose.model('Device'),
        User = mongoose.model('User');

    module.exports = function (messagingEngine, message) {
        console.log("Handling hi message, deviceId: " + message.deviceId);

        var storeNewDevice = function (deviceId, callback) {
            var newDevice = new Device({
                    deviceId: deviceId,
                    active: false,
                    location: 'TBD',
                    name: 'TBD',
                defaultSlideShowId: null,
                isNew: true
                });
            User.findOne({username: 'admin'}, function (err, adminUser) {
                if (err) {
                    console.log('Admin user cannot be found, error message: ' + errorHandler.getErrorMessage(err));
                    throw err;
                };

                newDevice.user = adminUser;

                newDevice.save(function (err, device) {
                    if (err) {
                        console.log('Error during saving new device with id' + deviceId + ', error message: ' + errorHandler.getErrorMessage(err));
                    } else {
                        callback(device);
                    }
                });
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
                storeNewDevice(message.deviceId, function(newDevice) {
                    publishAction('newDeviceSaidHi', {objectId: newDevice.id});
                });
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
