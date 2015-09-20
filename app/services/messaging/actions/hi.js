/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        Promise = require('promise'),
        errorHandler = require('../../../controllers/errors.server.controller'),
        Device = mongoose.model('Device'),
        User = mongoose.model('User'),
        Admin = mongoose.model('Admin'),
        Slideshow = mongoose.model('Slideshow');

    module.exports = function (messagingEngine, message) {
        console.log("Handling hi message, deviceId: " + message.deviceId);

        var storeNewDevice = function (deviceId, callback) {

            var findAdmin = new Promise(function (resolve, error) {
                Admin.findOne(function (err, admin) {
                    if (err) {
                        error(err);
                        errorHandler(err);
                    }
                    resolve(admin);
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

            Promise.all([findAdmin, findUser]).then(function (results) {
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
                        location: 'TBD',
                        name: 'TBD',
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

            });


        };

        var onFindOne = function (err, device) {
            if (err) {
                throw err;
            }

            if (!device) {
                storeNewDevice(message.deviceId, function (newDevice) {
                    messagingEngine.publishToServerChannel({
                        action: 'newDeviceSaidHi',
                        content: {
                            objectId: newDevice.id
                        }
                    });
                    newDevice.sendDeviceSetupMessage();
                });
                return;
            }

            device.sendDeviceSetupMessage();
        };

        console.log("searching for : " + message.deviceId);
        Device.findOne({
            deviceId: message.deviceId
        }).populate('slideAgregation.playList.slideShow').exec(onFindOne);
    };
}());
