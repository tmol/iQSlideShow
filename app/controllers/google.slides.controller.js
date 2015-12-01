/*jslint nomen: true, vars: true, unparam: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var googleSlides = require('../services/googleSlides');
    exports.renderSlides = function (req, res) {
        res.jsonp(req.slideShow);
    };
    exports.getSlides = function (req, res, next, slideShowId) {
        googleSlides.loadSlides(slideShowId, function (result) {
           req.slideShow = result;
           next();
        }, function (err) {
           throw err;
        });
    };
}());
