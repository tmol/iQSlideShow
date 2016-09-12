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
        Promise = require('promise'),
        User = mongoose.model('User'),
        messageHandler = require('../services/messaging/messageHandler');

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

    function ensureUniqueDeviceName(res, device, onDeviceUnique) {
        Device.findByName(device.name, function (devices) {
            if (devices.length === 0
                    || (devices.length === 1 && devices[0]._id.toString() === device._id)) {
                onDeviceUnique();
            } else {
                res.status(400).send({
                    message: "Device with name '" + device.name + "' already exists."
                });
            }
        }, function (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    }

    function executeUpdate(req, res) {
        var device = req.device,
            updatedDevice = req.body,
            slideShowIdToPlay,
            config,
            deviceAttributesChanges = new DeviceAttributesChanges(device, updatedDevice),
            deviceSetupMessageSlideShowIdToPlay;

        if (deviceAttributesChanges.deviceJustSetActive() || deviceAttributesChanges.defaultSlideShowChangedInActiveMode()) {
            deviceSetupMessageSlideShowIdToPlay = updatedDevice.defaultSlideShowId;
        } else if (deviceAttributesChanges.deviceJustSetInactive()) {
            Config.findOne(function (err, config) {
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
    }

    exports.update = function (req, res) {
        var device = req.device,
            updatedDevice = req.body;

        ensureUniqueDeviceName(res, updatedDevice, function () {
            executeUpdate(req, res);
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
        var regex = new RegExp('.*' + nameFilter + '.*', 'i');
        return { $regex: regex };
    };

    exports.list = function (req, res) {
        Device.findByFilter(req.query, function (devices) {
            res.jsonp(devices);
        }, function (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
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
        Device.findOne({"deviceId": id}).populate({ //TODO: this dosen't work. I don't understand why!!!!
            path: 'slideAgregation.playList.slideShow',
            model: 'Slideshow',
            populate: {
                path: 'user',
                model: 'User',
                select: 'displayName'
            }
        }).exec(function (err, device) {
            if (err) {
                return next(err);
            }
            if (!device) {
                return next(new Error('Failed to load Device ' + id));
            }

            //TODO: had to populate the users in this way because populate on graph dosen't work :(
            var promises = [];
            device.slideAgregation.playList.forEach(function (item) {
                promises.push(new Promise(function (resolve, error) {
                    item.slideShow.populate('user', 'displayName', function () {
                        resolve();
                    });
                }));
            });
            Promise.all(promises).then(function () {
                req.device = device;
                next();
            }, function () {
                next();
            });


            //next();
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
    };

    exports.filteredNames = function (req, res, next, nameFilter) {
        Config.findOne(function (err, config) {
            if (err) {
                error(err);
                return;
            }
            var query = Device.find({name: getNameFilterExpression(nameFilter)});
            if (config !== null) {
                query = query.limit(config.sizeOfAutocompleteListForTags);
            }
            query.exec(function (err, devices) {
                if (err) {
                    return next(err);
                }
                if (!devices) {
                    req.filteredNames = [];
                }
                req.filteredNames = lodash.map(devices, mapDeviceToFilteredName);
                next();
            });
        });
        
    };

    exports.getFilteredNames = function (req, res,  next) {
        res.jsonp(req.filteredNames);
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
