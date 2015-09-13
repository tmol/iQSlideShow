/*global require, exports, console*/
/*jslint es5: true */
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        adminController = require('./admin.server.controller'),
        messagingEngineFactory = require('../services/messaging/messagingEngineFactory'),
        Device = mongoose.model('Device'),
        Admin = mongoose.model('Admin'),
        lodash = require('lodash'),
        messageHandler = require('../services/messaging/messageHandler');

    /**
     * Create a Device
     */
    exports.create = function (req, res) {
        var device = new Device(req.body);
        device.user = req.user;

        device.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(device);
            }
        });
    };

    /**
     * Show the current Device
     */
    exports.read = function (req, res) {
        res.jsonp(req.device);
    };

    function DeviceAttributesChanges(device, updatedDevice) {
        this.updatedDevice = updatedDevice;
        this.device = device;

        this.deviceJustSetActive = function (updatedDevice, device) {
            return this.device.active === false && this.updatedDevice.active === true;
        };

        this.defaultSlideShowChangedInActiveMode = function () {
            return this.device.defaultSlideShowId !== this.updatedDevice.defaultSlideShowId
                && this.device.active === this.updatedDevice.active
                && this.device.active;
        };

        this.deviceJustSetInactive = function (updatedDevice, device) {
            return this.device.active === true && this.updatedDevice.active === false;
        };
    }

    /**
     * Update a Device
     */
    exports.update = function (req, res) {
        var device = req.device,
            updatedDevice = req.body,
            slideShowIdToPlay,
            config,
            deviceAttributesChanges = new DeviceAttributesChanges(device, updatedDevice),
            deviceSetupMessageSlideShowIdToPlay;

        if (deviceAttributesChanges.deviceJustSetActive() || deviceAttributesChanges.defaultSlideShowChangedInActiveMode()) {
            console.log("devise set active or default slide show changed");
            deviceSetupMessageSlideShowIdToPlay = updatedDevice.defaultSlideShowId;
        } else if (deviceAttributesChanges.deviceJustSetInactive()) {
            console.log("devise set inactive");
            Admin.findOne(function (err, config) {
                if (err) {
                    throw err;
                }
                deviceSetupMessageSlideShowIdToPlay = config.defaultSlideShowId;
            });
        }

        device = lodash.extend(device, req.body);

        device.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (deviceSetupMessageSlideShowIdToPlay) {
                    device.sendDeviceSetupMessageWithSlideShowIdToPlay(deviceSetupMessageSlideShowIdToPlay);
                }
                res.jsonp(device);
            }
        });
    };

    /**
     * Delete an Device
     */
    exports.delete = function (req, res) {
        var device = req.device;

        device.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(device);
            }
        });
    };

    /**
     * List of Devices
     */
    exports.list = function (req, res) {
        Device.find().sort('-created').populate('user', 'displayName').exec(function (err, devices) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(devices);
            }
        });
    };

    /**
     * Device middleware
     */
    exports.deviceByID = function (req, res, next, id) {
        Device.findOne({"deviceId": id}).populate('user').exec(function (err, device) {
            if (err) {
                return next(err);
            }
            if (!device) {
                return next(new Error('Failed to load Device ' + id));
            }
            req.device = device;
            next();
        });
    };

    /**
     * Device authorization middleware
     */
    exports.hasAuthorization = function (req, res, next) {
        if (req.device.user.id !== req.user.id) {
            return res.status(403).send('User is not authorized');
        }
        next();
    };
}());
