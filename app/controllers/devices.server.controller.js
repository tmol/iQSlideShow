'use strict';

var connectedDevies = require('../modules/connectedDevices'),
    _ = require('lodash');

exports.renderDevice = function(req, res){
    res.jsonp(req.device);
}

exports.getDevices = function(req, res) {
    var devices = { devices : connectedDevies.connectedDevicesSingleton.getInstance().devices };
    res.jsonp(devices);
}

exports.getDeviceById = function(req, res, next, deviceId) {
    var devices = connectedDevies.connectedDevicesSingleton.getInstance().devices;
    if (!devices) return next(new Error('Failed to load devices'));

    var device =_.find(devices, function (device) {
        return device.id = deviceId;
    });

    if (!device) return next(new Error('Failed to load device with ID ' + deviceId));

    req.device = device;
    next();
}
