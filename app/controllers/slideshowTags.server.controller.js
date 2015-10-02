/*global require, exports, console*/
(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        SlideShowTag = mongoose.model("SlideShowTag"),
        Config = mongoose.model("Config");

    exports.tags = function (req, res, tag) {
        res.jsonp(req.tags);
    };

    exports.list = function (req, res) {
        Config.findOne(function (err, admin) {
            if (err) {
                throw err;
            }
            var limit = 100;
            if (admin) {
                limit = admin.sizeOfAutocompleteListForTags;
            }
            console.log("Limit1 : " + limit);
            SlideShowTag.find({}).sort({value: 1}).limit(limit).exec(function (err, tags) {
                if (err) {
                    return res.status(400).send(err);
                }
                if (!tags) {
                    return res.status(400).send('Failed to load tags');
                }
                res.jsonp(tags);
            });
        });
    };

    exports.getTags = function (req, res, next, tag) {
        Config.findOne(function (err, admin) {
            if (err) {
                throw err;
            }
            var limit = 100;
            if (admin) {
                limit = admin.sizeOfAutocompleteListForTags;
            }
            console.log("Limit2 : " + limit);
            SlideShowTag.find({value: {$regex: new RegExp("^" + tag)}}).sort({value: 1}).limit(limit).exec(function (err, tags) {
                if (err) {
                    return next(err);
                }
                if (!tags) {
                    return next(new Error('Failed to load tags '));
                }
                req.tags = tags;
                next();
            });
        });
    };
}());
