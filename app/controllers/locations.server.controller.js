(function() {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Location = mongoose.model('Location'),
        _ = require('lodash');

    exports.create = function(req, res) {
        var location = new Location(req.body);

        location.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(location);
            }
        });
    };

    exports.update = function(req, res) {
        var location = req.location ;

        location = _.extend(location , req.body);

        location.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(location);
            }
        });
    };

    exports.delete = function(req, res) {
        var location = req.location ;

        location.remove(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(location);
            }
        });
    };


    exports.list = function(req, res) {
        Location.find().sort('name').exec(function(err, locations) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(locations);
            }
        });
    };

    exports.hasAuthorization = function(req, res, next) {
        next();
    };
}());
