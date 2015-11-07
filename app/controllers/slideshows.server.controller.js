/*global require, exports*/
/*jslint nomen: true*/
(function () {
    'use strict';

    var fs = require('fs'),
        mongoose = require('mongoose'),
        errorHandler = require('./errors.server.controller'),
        Slideshow = mongoose.model('Slideshow'),
        Device = mongoose.model('Device'),
        Promise = require("Promise"),
        lodash = require('lodash'),
        Async = require("async");

    /**
     * Create a Slideshow
     */
    exports.create = function (req, res) {
        var slideshow = new Slideshow(req.body);
        slideshow.user = req.user;

        slideshow.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slideshow);
        });
    };

    /**
     * Show the current Slideshow
     */
    exports.read = function (req, res) {
        var slideshow = req.slideshow;
        if (!slideshow.draftSlides || slideshow.draftSlides.length === 0) {
            slideshow.draftSlides = slideshow.slides;
        }
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

        slideshow.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slideshow);
        });
    };

    /**
     * Delete an Slideshow
     */
    exports.delete = function (req, res) {
        var slideshow = req.slideshow;

        slideshow.remove(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            res.jsonp(slideshow);
        });
    };

    var mapSlideshowToFilteredName = function (slideShow) {
        return {_id: slideShow._id, name: slideShow.name};
    };

    var mapSlideShowToTags = function (slideShow) {
        return slideShow.tags;
    };

    var preparePromiseForFilter = function (select, req, actionOnFind) {
        var showOnlyMine = req.query.showOnlyMine;

        if (showOnlyMine !== null && showOnlyMine === 'true') {
            select.user = req.user._id;
        }
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
        var select = {},
            promises = [],
            promise,
            filterResult = { names: [], tags: [] },
            namesAndTagsFilter = req.query.namesAndTagsFilter,
            tagsRegExp = '.*' + namesAndTagsFilter + '.*';

        if (namesAndTagsFilter !== null && namesAndTagsFilter.length > 0) {
            select = {name : { $regex: '^' + namesAndTagsFilter, $options: 'i' }};
            promise = preparePromiseForFilter(select, req, function (slideshowsFound) {
                filterResult.names =  lodash.map(lodash.uniq(slideshowsFound), mapSlideshowToFilteredName);
            });
            promises.push(promise);

            select = {tags : { $elemMatch: {$regex: tagsRegExp, $options: 'i' }}};
            promise = preparePromiseForFilter(select, req, function (slideshowsFound) {
                filterResult.tags = lodash.map(slideshowsFound, mapSlideShowToTags);
                filterResult.tags = lodash.flatten(filterResult.tags);
                filterResult.tags = lodash.uniq(filterResult.tags);
                filterResult.tags = lodash.filter(filterResult.tags, function (tag) {
                    return tag.match(new RegExp(tagsRegExp, 'i'));
                });
            });
            promises.push(promise);
        }

        Promise.all(promises).then(function () {
            res.jsonp(filterResult);
        }, function (error) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
        });
    };

    var concatUnique = function (slideshows, foundSlideShows) {
        return lodash.uniq(slideshows.concat(foundSlideShows));
    };

    var ensureArray = function (object) {
        if (!lodash.isArray(object)) {
            return [object];
        }
        return object;
    };

    exports.list = function (req, res) {
        var nameFilters = req.query.nameFilters,
            tagFilters = req.query.tagFilters,
            tagAndNameFilter = req.query.tagAndNameFilter,
            select = {},
            promise,
            slideshows = [],
            promises = [];

        if (tagAndNameFilter && tagAndNameFilter.length > 0) {
            select = {
                name : { $regex: '^' + tagAndNameFilter, $options: 'i' },
                tags : { $elemMatch: {$regex: '.*' + tagAndNameFilter + '.*', $options: 'i' }}
            };
            promise = preparePromiseForFilter(select, req, function (foundSlideShows) {
                slideshows = concatUnique(slideshows, foundSlideShows);
            });
            promises.push(promise);
        }

        if (nameFilters && nameFilters.length > 0) {
            nameFilters = ensureArray(nameFilters);
            select = {name : {$in: nameFilters }};
            promise = preparePromiseForFilter(select, req, function (foundSlideShows) {
                slideshows = concatUnique(slideshows, foundSlideShows);
            });
            promises.push(promise);
        }

        if (tagFilters && tagFilters.length > 0) {
            tagFilters = ensureArray(tagFilters);
            select = {tags : {$in: tagFilters }};
            promise = preparePromiseForFilter(select, req, function (foundSlideShows) {
                slideshows = concatUnique(slideshows, foundSlideShows);
            });
            promises.push(promise);
        }

        if (lodash.keys(select).length === 0) {
            promise = preparePromiseForFilter({}, req, function (foundSlideShows) {
                slideshows = concatUnique(slideshows, foundSlideShows);
            });
            promises.push(promise);
        }

        Promise.all(promises).then(function () {
            res.jsonp(slideshows);
        }, function (error) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
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
            res.jsonp(files);
        });
    };

    exports.getDevices = function (req, res) {
        Device.findByFilter(req.query, function (devices) {

            var playOnDevices = devices.map(function (device) {
                var isSlideShowInPlayList = device.slideAgregation && device.slideAgregation.playList.some(function (entry) {
                    return entry.slideShow && entry.slideShow.toString() === req.slideshow._id;
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
                    return selectedDevice._id === device._id;
                });

                if (!device.slideAgregation) {
                    device.slideAgregation = {
                        agregationMode: "sequential",
                        playList: []
                    };
                }
                var slideShowIsInPlayList = device.slideAgregation.playList.some(function (entry) {
                    return entry.slideShow && entry.slideShow.toString() === req.slideshow._id;
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
                        return entry.slideShow && entry.slideShow.toString() !== req.slideshow._id;
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
