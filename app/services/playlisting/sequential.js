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

                //todo: move this part on slide save
                objectSlide.slideShowName = entry.slideShow.name;
                objectSlide.author = entry.slideShow.user ? entry.slideShow.user.displayName : "";
                objectSlide.publishedOnDate = entry.slideShow.publishedOnDate;

                slides.push(objectSlide);
            });
        });

        return slides;
    };
}());
