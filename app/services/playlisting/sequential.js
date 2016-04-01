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
                var objectSlide = slide.toObject();
                objectSlide.slideShowName = entry.slideShow.name;
                console.log(objectSlide.slideShowName);
                slides.push(objectSlide);
            });
        });

        return slides;
    };
}());
