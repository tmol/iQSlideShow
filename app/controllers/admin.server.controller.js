/*global require, exports*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Admin = mongoose.model('Admin'),
        Device = mongoose.model('Device'),
        Promise = require('promise'),
        lodash = require('lodash');

    exports.getConfig = function (req, res) {
        Admin.findOne(function (err, admin) {
            if (err) {
                throw err;
            }
            if (admin === null) {
                var config = new Admin({
                    userSelectedSlideShowsPlayTimeInMinutes: 1,
                    defaultSlideShowId: null
                });
                config.user = req.user;

                config.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(config);
                    }
                });
            } else {
                res.jsonp(admin);
            }
        });
    };

    exports.updateConfig = function (req, res) {
        var admin = new Admin(req.body);
        /*jslint nomen: true*/
        Admin.findById(admin._id).exec(function (err, storedAdmin) {
            /*jslint nomen: false*/
            if (err) {
                throw err;
            }
            if (!storedAdmin) {
                throw 'No config available';
            }
            storedAdmin = lodash.extend(storedAdmin, req.body);

            storedAdmin.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(storedAdmin);
                }
            });
        });
    };

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
        if (req.admin.user.id !== req.user.id) {
            return res.status(403).send('User is not authorized');
        }
        next();
    };
}());
