/*global require, exports*/
(function () {
    'use strict';
    exports.getSlides = function (playList) {
        var slides = [];
        playList.forEach(function (entry) {
            if (!entry.slideShow) {
                return;
            }
            if (!entry.slideShow.slides) {
                return;
            }

            entry.slideShow.slides.forEach(function (slide) {
                slides.push(slide);
            });
        });

        return slides;
    };
}());
