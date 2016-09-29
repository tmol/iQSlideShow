/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        Promise = require('promise'),
        errorHandler = require('../../../controllers/errors.server.controller'),
        Device = mongoose.model('Device'),
        User = mongoose.model('User'),
        Config = mongoose.model('Config'),
        Slideshow = mongoose.model('Slideshow'),
        AppConfig = require('../../../../config/config');

    module.exports = function (messagingEngine, message, resolveHi, errorHi) {
        console.log("Handling hi message, deviceId: " + message.deviceId);

        var storeNewDevice = function (deviceId, callback) {

            var findConfig = new Promise(function (resolve, error) {
                Config.findOne(function (err, config) {
                    if (err) {
                        error(err);
                        errorHandler(err);
                    }
                    resolve(config);
                });
            });

            var findUser = new Promise(function (resolve, error) {
                User.findOne({username: 'admin'}, function (err, adminUser) {
                    if (err) {
                        error(err);
                        console.log('Admin user cannot be found, error message: ' + errorHandler.getErrorMessage(err));
                        errorHandler(err);
                    }
                    resolve(adminUser);
                });
            });

            Promise.all([findConfig, findUser]).then(function (results) {
                var configuration = results[0];
                var adminUser = results[1];

                Slideshow.findById(configuration.defaultSlideShowId).exec(function (err, slideshow) {
                    if (err) {
                        console.log('Default slideshow not found: ' + errorHandler.getErrorMessage(err));
                        throw err;
                    }

                    var newDevice = new Device({
                        deviceId: deviceId,
                        active: false,
                        location: 'To be defined',
                        lastHealthReport: new Date(),
                        name: 'New Device',
                        slideAgregation: {
                            agregationMode: "sequential",
                            playList: [{
                                slideShow: slideshow
                            }]
                        }
                    });

                    newDevice.user = adminUser;
                    newDevice.save(function (err, device) {
                        if (err) {
                            console.log('Error during saving new device with id' + deviceId + ', error message: ' + errorHandler.getErrorMessage(err));
                        } else {
                            callback(device);
                        }
                    });
                });
            }, errorHi);
        };

        var ifVersionOkSendDeviceSetupOtherwiseReloadMessage = function (device) {
            if (message.appVersion !== AppConfig.getAppVersion()) {
                resolveHi(device.getReloadMessage());
            } else {
                resolveHi(device.getDeviceSetupMessage());
            }
        };

        var onFindOne = function (err, device) {

            if (err) {
                errorHi(err);
            }

            if (!device) {
                storeNewDevice(message.deviceId, function (newDevice) {
                    messagingEngine.publishToServerChannel({
                        action: 'newDeviceSaidHi',
                        content: {
                            objectId: newDevice.deviceId
                        }
                    });
                    ifVersionOkSendDeviceSetupOtherwiseReloadMessage(newDevice);
                });
                return;
            }
            ifVersionOkSendDeviceSetupOtherwiseReloadMessage(device);
        };

        console.log("searching for : " + message.deviceId);
        Device.findOne({
            deviceId: message.deviceId
        }).populate('slideAgregation.playList.slideShow').exec(onFindOne);
    };
}());
