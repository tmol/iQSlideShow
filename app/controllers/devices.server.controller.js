'use strict';

var _ = require('lodash');

exports.renderDevice = function(req, res){
    res.jsonp(req.device);
}

exports.getDevices = function(req, res) {
    var devices = { devices : [] };
    res.jsonp(devices);
}

exports.getDeviceById = function(req, res, next, deviceId) {
    req.device = {};
    next();
}
