'use strict';

var connectedDevies = require('../modules/connectedDevices');

exports.getDevices = function(req, res) {
    var devices = { devices : connectedDevies.connectedDevicesSingleton.getInstance().devices };
    res.jsonp(devices);
}