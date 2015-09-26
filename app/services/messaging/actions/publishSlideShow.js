/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        Slideshow = mongoose.model('Slideshow');

    module.exports = function (messagingEngine, message, resolvePublish, errorPublish) {
        console.log("Handling publishSlide message, slideShowId: " + message.slideShowId);

        console.log("searching for slideShow: " + message.slideShowId);
        Slideshow.findById(message.slideShowId).exec(function (err, slideShow) {
            if (err) {
                errorPublish(err);
                return;
            }
            if (!slideShow) {
                errorPublish("Slideshow not found!");
                return;
            }
            slideShow.slides = slideShow.draftSlides;
            slideShow.save(function (err) {
                if (err) {
                    errorPublish(err);
                    return;
                }
                resolvePublish();
            });
        });
    };
}());
