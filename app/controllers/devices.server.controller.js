/*jslint nomen: true, vars: true, unparam: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        messagingEngineFactory = require('../services/messaging/messagingEngineFactory'),
        Device = mongoose.model('Device'),
        Config = mongoose.model('Config'),
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
            Config.findOne(function (err, config) {
                if (err) {
                    throw err;
                }
                deviceSetupMessageSlideShowIdToPlay = config.defaultSlideShowId;
            });
        }

        device = lodash.extend(device, req.body);
        console.log(device);
        device.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Device.findOne({
                    deviceId: device.deviceId
                }).populate('slideAgregation.playList.slideShow').exec(function (err, fullDevice) {
                    if (err) {
                        throw err;
                    }
                    fullDevice.sendDeviceSetupMessage();
                });
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

    var getNameFilterExpression = function (nameFilter) {
        return { $regex: '^' + nameFilter, $options: 'i' };
    }

    exports.list = function (req, res) {
        var select = {},
            locationsFilter,
            nameFilter;

        if (req.query.locations) {
            locationsFilter = req.query.locations;
            if (locationsFilter && locationsFilter.length > 0) {
                if (!(locationsFilter instanceof Array)) {
                    locationsFilter = [locationsFilter];
                }
                select.location = { $in : locationsFilter };
            }
        }

        if (req.query.name) {
            nameFilter = req.query.name;
            if (nameFilter && nameFilter.length > 0) {
                select.name =  getNameFilterExpression(nameFilter);
            }
        }

        Device.find(select).sort('-created').populate('user', 'displayName').exec(function (err, devices) {
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
        Device.byId(id).exec(function (err, device) {
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

    exports.deviceWithSlidesByID = function (req, res, next, id) {
        Device.findOne({"deviceId": id}).populate('slideAgregation.playList.slideShow').exec(function (err, device) {
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

    exports.getSlides = function (req, res) {
        res.jsonp(req.device.getSlides());
    };

    exports.healthReport = function (req, res) {
        var device = req.device;

        device.lastHealthReport = new Date();
        device.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({ report: 'ok' });
            }
        });
    };

    exports.devicesByLocation = function (req, res, next, locationName) {
        Device.find({"location": locationName}).exec(function (err, devices) {
            if (err) {
                return next(err);
            }
            if (!devices) {
                req.devices = [];
            }
            req.devices = devices;
            next();
        });
    };

    exports.getDevicesByLocation = function (req, res,  next) {
        res.jsonp(req.devices);
    };

    var mapDeviceToFilteredName = function (device) {
        return {_id: device._id, name: device.name};
    }

    exports.filteredNames = function (req, res, next, nameFilter) {
        Device.find({name: getNameFilterExpression(nameFilter)}).exec(function (err, devices) {
            if (err) {
                return next(err);
            }
            if (!devices) {
                req.filteredNames = [];
            }
            req.filteredNames = lodash.map(devices, mapDeviceToFilteredName);
            next();
        });
    };

    exports.getFilteredNames = function (req, res,  next) {
        res.jsonp(req.filteredNames);
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
