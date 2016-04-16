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
        Device = mongoose.model('Device');


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
                }
                res.jsonp(audit);
            });
        });
    };
    var getAuditQuery = function (query) {
        var select = {},
            createdQueryExpression = {},
            startDate = query.startDate,
            endDate = query.endDate;

        if (startDate) {
            createdQueryExpression.$gte = new Date(startDate);
        }
        if (endDate) {
            createdQueryExpression.$lte = new Date(endDate);
        }
        if (startDate || endDate) {
            select.created = createdQueryExpression;
        }

        return Audit.find(select).sort('-created');
    };

    exports.list = function (req, res) {
        getAuditQuery(req.query).exec(function (err, audits) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(audits);
        });
    };
    exports.csv = function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=audit.csv'
        });
        getAuditQuery(req.query).csv(res);
    };
    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
