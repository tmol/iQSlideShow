/*global require, exports, console*/
(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose');
    var errorHandler = require('./errors.server.controller');
    var SlidesRepositoryItem = mongoose.model("SlidesRepository");
    var lodash = require('lodash');

    exports.renderSlide = function (req, res) {
        res.jsonp(req.slide);
    };

    exports.renderSlides = function (req, res) {
        res.jsonp(req.slides);
    };

    exports.getSlideById = function (req, res, next, slideId) {
        SlidesRepositoryItem.findOne({"slide._id": slideId}).sort({$natural: -1}).exec(function (err, slide) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!slide) {
                slide = new SlidesRepositoryItem();
            }
            req.slide = slide;
            next();
        });
    };

    exports.getSlideByFilter = function (req, res) {
        var filter = req.body.filters.map(function (item) {
            if (!item) {
                item = "^";
            }
            return new RegExp(item);
        });
        console.log(filter);
        SlidesRepositoryItem.find({"name": {$in: filter}}).populate('user', 'displayName').exec(function (err, slides) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slides);
        });
    };

    exports.getSlides = function (req, res) {
        SlidesRepositoryItem.find({}).exec(function (err, slides) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slides);
        });
    };

    exports.storeByName = function (req, res) {
        var slide = req.slide;
        slide = lodash.extend(slide, req.body);
        SlidesRepositoryItem.findOne({"name": req.body.name}).exec(function (err, slide) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (!slide) {
                slide = new SlidesRepositoryItem();
            }

            slide = lodash.extend(slide, req.body);
            slide.user = req.user;
            slide.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.jsonp(slide);
            });
        });
    };
}());
