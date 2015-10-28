/*global require, exports*/
/*jslint nomen: true*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Audit = mongoose.model('Audit'),
        Device = mongoose.model('Device'),
        _ = require('lodash');


    exports.create = function (req, res) {
        var audit = new Audit(req.body);
        audit.created = new Date();

        Device.byId(audit.deviceId).exec(function (err, device) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!device) {
                return res.status(400).send({
                    message: 'Failed to load Device ' + audit.deviceId
                });
            }

            audit.location = device.location;
            audit.deviceName = device.name;
            audit.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(audit);
                }
            });
        });
    };

    exports.list = function (req, res) {
        var select = {},
            createdQueryExpression = {},
            auditsFilter,
            startDate = req.query.startDate,
            endDate = req.query.endDate;

        if (startDate) {
            createdQueryExpression.$gte = startDate;
        }
        if (endDate) {
            createdQueryExpression.$lte = endDate;
        }
        if (createdQueryExpression.length > 0) {
            select.created = createdQueryExpression;
        }

        Audit.find(select).sort('-created').exec(function (err, audits) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(audits);
            }
        });
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
