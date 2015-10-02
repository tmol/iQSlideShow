/*global require, exports, mongoose*/
(function () {
    'use strict';

    var errorHandler = require('./errors.server.controller'),
        mongoose = require('mongoose'),
        Promise = require('promise'),
        Device = mongoose.model('Device');

    exports.reload = function (req, res) {
        var idx,
            promises = [];

        Device.find().sort('-created').exec(function (err, devices) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                for (idx = 0; idx < devices.length; idx = idx + 1) {
                    promises.push(new Promise(function (resolve, error) {
                        var device = devices[idx];
                        device.sendReloadMessage(function () {
                            device.reloadRequested = new Date();
                            device.save(function (err) {
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                }
                                resolve({
                                    name: device.name,
                                    deviceId: device.deviceId,
                                    location: device.location
                                });
                            }
                                       );
                        });
                    }));
                }

                Promise.all(promises).then(function (reloadedDevices) {
                    res.jsonp({reloadedDevices: reloadedDevices});
                });
            }
        });
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
