/*global require, exports, console*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        SlideBlueprint = mongoose.model("SlideBlueprint"),
        lodash = require('lodash'),
        Promise = require('Promise'),
        NamesAndTagsFilter = require('../services/namesAndTagsFilter');

    exports.renderSlide = function (req, res) {
        res.jsonp(req.slide);
    };

    exports.renderSlides = function (req, res) {
        res.jsonp(req.slides);
    };

    exports.delete = function (req, res) {
        var slide = req.slide;

        slide.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slide);
        });
    };

    exports.getSlideById = function (req, res, next, slideId) {
        SlideBlueprint.findOne({"slide._id": slideId}).sort({$natural: -1}).exec(function (err, slide) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!slide) {
                slide = new SlideBlueprint();
            }
            req.slide = slide;
            next();
        });
    };

    exports.getSlides = function (req, res) {
        SlideBlueprint.find({}).exec(function (err, slides) {
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
        SlideBlueprint.findOne({"name": req.body.name}).exec(function (err, slide) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (slide) {
                return res.status(400).send({
                    message: 'Blueprint with the given name already exists.'
                });
            }

            slide = new SlideBlueprint();
            delete req.body._id;
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

    var preparePromiseForFilter = function (select, req, actionOnFind) {
        var promise = new Promise(function (resolve, reject) {
            SlideBlueprint.find(select).sort('-created').populate('user', 'displayName').exec(function (err, slideshowsFound) {
                if (err) {
                    reject(err);
                    return;
                }

                actionOnFind(slideshowsFound);
                resolve();
            });
        });

        return promise;
    };

    exports.getFilteredNamesAndTags = function (req, res) {
        NamesAndTagsFilter.getFilteredNamesAndTags(req, preparePromiseForFilter, function (filterResult) {
            res.jsonp(filterResult);
        }, function (error) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
        });
    };

    exports.getSlideByFilter = function (req, res) {
        NamesAndTagsFilter.filter(req, SlideBlueprint, function (filterResult) {
            res.jsonp(filterResult);
        }, function (error) {
            console.log(error);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
        });
    };
}());
