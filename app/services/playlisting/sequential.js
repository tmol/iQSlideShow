/*global require, exports*/
(function () {
    'use strict';
    var lodash = require('lodash');
    exports.getSlides = function (playList) {
        var slides = [];
        playList.forEach(function (entry) {
            if (!entry.slideShow) {
                return;
            }
            if (!entry.slideShow.slides) {
                return;
            }

            entry.slideShow.slides.forEach(function (slide, index) {
                var copyOfSlide = slide.toObject();
                copyOfSlide.slideShowId = entry.slideShow._id;
                copyOfSlide.slideNumber =  index;
                slides.push(copyOfSlide);
            });
        });

        return slides;
    };
}());
