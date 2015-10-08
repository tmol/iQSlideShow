/*global require, exports*/
/*jslint nomen: true*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Location = mongoose.model('Location'),
        Devices = mongoose.model('Device'),
        _ = require('lodash');

    exports.create = function (req, res) {
        var location = new Location(req.body);

        location.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(location);
            }
        });
    };

    exports.update = function (req, res) {
        var location = req.location,
            formerLocationName = location.name;

        location = _.extend(location, req.body);

        Devices.update({ location: formerLocationName}, { location: location.name }, { multi: true }, function (err, raw) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            location.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(location);
                }
            });
        });
    };

    exports.deleteLocation = function (req, res) {
        var location = req.location;

        location.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(location);
            }
        });
    };


    exports.list = function (req, res) {
        Location.find().sort('name').exec(function (err, locations) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(locations);
            }
        });
    };

    exports.locationByID = function (req, res, next, id) {
        Location.findById(id).exec(function (err, location) {
            if (err) {
                return next(err);
            }
            if (!location) {
                return next(new Error('Failed to load Location ' + id));
            }
            req.location = location;
            next();
        });
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
