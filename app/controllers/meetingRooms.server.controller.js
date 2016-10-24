(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Device = mongoose.model('Device'),
        lodash = require('lodash');

    exports.list = function (req, res) {
        Device.find(function (err, devices) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (!devices) {
                req.devices = [];
            }

            var rooms = lodash.map(devices, function(device, index) {
                var status = device.active ? 'available' : 'occupied';

                if (!device.lastHealthReport) {
                    status = 'not-available';
                }

                var lastHeathReport = new Date(device.lastHealthReport),
                    minutesPassedSinceLastHealthReport = (new Date().getTime() - lastHeathReport.getTime()) / (1000 * 60);
                if (minutesPassedSinceLastHealthReport > 5) {
                    status = 'not-available';
                }

                return {
                    roomName: device.name,
                    city: device.location,
                    building: index % 2 === 1 ? device.location : null,
                    status: status
                }
            });

            res.jsonp(rooms);
        });
    };
}());
