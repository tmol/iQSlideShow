/*global require, exports*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Admin = mongoose.model('Admin'),
        lodash = require('lodash');


    /**
     * Show the current Admin
     */
    exports.getConfig = function (req, res) {
        Admin.findOne(function (err, admin) {
            if (err) {
                throw err;
            }
            if (admin === null) {
                var config = new Admin({
                    userSelectedSlideShowsPlayTimeInMinutes: 1,
                    defaultSlideShowId: null
                });
                config.user = req.user;

                config.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(config);
                    }
                });
            } else {
                res.jsonp(admin);
            }
        });
    };

    /**
     * Update a Admin
     */
    exports.updateConfig = function (req, res) {
        var admin = new Admin(req.body);
        /*jslint nomen: true*/
        Admin.findById(admin._id).exec(function (err, storedAdmin) {
            /*jslint nomen: false*/
            if (err) {
                throw err;
            }
            if (!storedAdmin) {
                throw "No config available";
            }
            storedAdmin = lodash.extend(storedAdmin, req.body);

            storedAdmin.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(storedAdmin);
                }
            });
        });
    };

    /**
     * Admin authorization middleware
     */
    exports.hasAuthorization = function (req, res, next) {
        if (req.admin.user.id !== req.user.id) {
            return res.status(403).send('User is not authorized');
        }
        next();
    };
}());
