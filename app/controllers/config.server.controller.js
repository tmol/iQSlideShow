/*global require, exports*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Config = mongoose.model('Config'),
        lodash = require('lodash');

    exports.getConfig = function (req, res) {
        Config.findOne(function (err, config) {
            if (err) {
                throw err;
            }
            if (config === null) {
                config = new Config({
                    userSelectedSlideShowsPlayTimeInMinutes: 1,
                    defaultSlideShowId: null,
                    defaultAnimationType : "enter-left"
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
                res.jsonp(config);
            }
        });
    };

    exports.updateConfig = function (req, res) {
        var config = new Config(req.body);
        /*jslint nomen: true*/
        Config.findById(config._id).exec(function (err, storedConfig) {
            /*jslint nomen: false*/
            if (err) {
                throw err;
            }
            if (!storedConfig) {
                throw 'No config available';
            }
            storedConfig = lodash.extend(storedConfig, req.body);

            storedConfig.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(storedConfig);
                }
            });
        });
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
