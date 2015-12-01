/*jslint nomen: true, vars: true, unparam: true*/
/*global module, require*/
(function () {
    'use strict';

    module.exports = function (app) {
        var googleSlides = require('../../app/controllers/google.slides.controller');

        // Devices Routes
        app.route('/googleSlides/:slideShowId')
            .get(googleSlides.renderSlides);
        app.param('slideShowId', googleSlides.getSlides);
    };
}());
