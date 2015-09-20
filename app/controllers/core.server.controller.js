'use strict';

/**
 * Module dependencies.
 */
exports.index = function (req, res) {
    res.render('index', {
        user: req.user || null,
        request: req
    });
};
exports.slideshow = function (req, res) {
    res.render('slideshow', {
        request: req
    });
};
