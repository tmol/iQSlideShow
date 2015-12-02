/*global require, exports*/
(function () {
    'use strict';
    var googleSlides = require("./googleSlides");
    exports.explodeSlide = function (slide, onSuccess, onError) {
        googleSlides.loadSlides(slide.content.slideShowId, function (result) {
            if (result.length) {
                onSuccess(result);
                return;
            }
            onSuccess(null);
        }, onError);
    };
}());
