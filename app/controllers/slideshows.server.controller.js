/*global require, exports*/
/*jslint nomen: true*/
(function () {
    'use strict';

    var fs = require('fs'),
        mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Slideshow = mongoose.model('Slideshow'),
        Device = mongoose.model('Device'),
        Promise = require('promise'),
        lodash = require('lodash'),
        Async = require('async'),
        NamesAndTagsFilter = require('../services/namesAndTagsFilter'),
        FindInStringRegex = require('../services/findInStringRegex');

    function ensureUniqueSlideShowName(res, slideShow, onNameUnique) {
        Slideshow.findByName(slideShow.name, function (slideShows) {
            if (slideShows.length === 0
                    || (slideShow._id && slideShows.length === 1 && slideShows[0]._id.toString() === slideShow._id.toString())) {
                onNameUnique();
            } else {
                res.status(400).send({
                    message: "Slideshow with name '" + slideShow.name + "' already exists."
                });
            }
        }, function (err) {
            res.status(400).send({
                message: err.message
            });
        });
    }

    exports.create = function (req, res) {
        var slideshow = new Slideshow(req.body);
        slideshow.user = req.user;

        ensureUniqueSlideShowName(res, slideshow, function () {
            slideshow.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.jsonp(slideshow);
            });
        });
    };

    /**
     * Show the current Slideshow
     */
    exports.read = function (req, res) {
        var slideshow = req.slideshow;
        res.jsonp(slideshow);
    };

    exports.readSlide = function (req, res) {
        res.jsonp(req.slide);
    };

    /**
     * Update a Slideshow
     */
    exports.update = function (req, res) {
        var slideshow = req.slideshow;

        slideshow = lodash.extend(slideshow, req.body);

        slideshow.published = false;
        slideshow.modified = new Date();
        ensureUniqueSlideShowName(res, slideshow, function () {
            slideshow.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.jsonp(slideshow);
            });
        });
    };

    /**
     * Delete an Slideshow
     */
    exports.delete = function (req, res) {
        var slideshow = req.slideshow;

        Device.update({'slideAgregation.playList.slideShow': slideshow._id},
                      { $pull: {'slideAgregation.playList': {slideShow: slideshow._id} }}, {multi: true}, function (err, result) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                slideshow.remove(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    res.jsonp(slideshow);
                });
            });
    };

    function processShowOnlyMineFilter(req, select) {
        var showOnlyMine = req.query.showOnlyMine;
        if (showOnlyMine !== null && showOnlyMine === 'true') {
            select.user = req.user._id;
        }
    }

    var preparePromiseForFilter = function (select, req, actionOnFind) {
        processShowOnlyMineFilter(req, select);
        var promise = new Promise(function (resolve, reject) {
            Slideshow.find(select).sort('-created').populate('user', 'displayName').exec(function (err, slideshowsFound) {
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

    exports.list = function (req, res) {
        NamesAndTagsFilter.filter(req, Slideshow, function (select) {
            processShowOnlyMineFilter(req, select);
            return select;
        }, function (filterResult) {
            res.jsonp(filterResult);
        }, function (error) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
        });
    };

    exports.filterByName = function (req, res) {
        var searchParam = req.query.nameFilter,
            filter = {name : FindInStringRegex.getFindInTextRegExp(searchParam)};
        Slideshow.find(filter).sort('-created').exec(function (err, slideshowsFound) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (!slideshowsFound) {
                return res.status(400).send({
                    message: 'Failed to search for active slideshows by name with the following search parameter: ' + searchParam
                });
            }

            res.jsonp(slideshowsFound);
        });
    };

    /**
     * Slideshow middleware
     */
    exports.slideshowByID = function (req, res, next, id) {
        Slideshow.findById(id).populate('user', 'displayName').exec(function (err, slideshow) {
            if (err) {
                return next(err);
            }
            if (!slideshow) {
                return next(new Error('Failed to load Slideshow ' + id));
            }
            req.slideshow = slideshow;
            next();
        });
    };

    exports.slideByNumber = function (req, res, next, number) {
        if (!req.slideshow) {
            return next(new Error('Failed to load slide'));
        }
        req.slide = req.slideshow.slides[number];
        next();
    };

    /**
     * Slideshow authorization middleware
     */
    exports.hasAuthorization = function (req, res, next) {
        next();
    };

    exports.getTemplates = function (req, res) {
        fs.readdir('public/modules/slideshows/slideTemplates', function (err, files) {
            if (err) {
                return res.status(400).send('Canot read templates');
            }
            lodash.remove(files, function (item) { return item === 'img'} );
            res.jsonp(files);
        });
    };

    exports.getDevices = function (req, res) {
        Device.findByFilter(req.query, function (devices) {

            var playOnDevices = devices.map(function (device) {
                var isSlideShowInPlayList = device.slideAgregation && device.slideAgregation.playList.some(function (entry) {
                    return entry.slideShow && entry.slideShow.toString() === req.slideshow._id.toString();
                });

                return {
                    _id: device._id,
                    name: device.name,
                    checked: isSlideShowInPlayList
                };
            });

            res.jsonp(playOnDevices);
        }, function (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
    };

    exports.setDevices = function (req, res) {
        var selectedDevices = req.body;

        Device.find({}, function (err, devices) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var devicesToSave = [];
            devices.forEach(function (device) {

                var deviceWasSelected = selectedDevices.some(function (selectedDevice) {
                    return selectedDevice._id === device._id.toString();
                });

                if (!device.slideAgregation) {
                    device.slideAgregation = {
                        agregationMode: "sequential",
                        playList: []
                    };
                }
                var slideShowIsInPlayList = device.slideAgregation.playList.some(function (entry) {
                    return entry.slideShow && entry.slideShow.toString() === req.slideshow._id.toString();
                });

                if (deviceWasSelected && !slideShowIsInPlayList) {
                    device.slideAgregation.playList.push({
                        slideShow: req.slideshow
                    });
                    devicesToSave.push(device);
                    return;
                }

                if (slideShowIsInPlayList && !deviceWasSelected) {
                    device.slideAgregation.playList = device.slideAgregation.playList.filter(function (entry) {
                        return entry.slideShow && entry.slideShow.toString() !== req.slideshow._id.toString();
                    });
                    devicesToSave.push(device);
                }
            });

            Async.each(devicesToSave, function (device, callback) {
                device.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        device.sendReloadMessage();
                        callback();
                    }
                });
            }, function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.status(200).send("");
            });
        });
    };
}());
