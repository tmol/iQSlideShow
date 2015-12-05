/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';
    var request = require('request');
    exports.loadSlides = function (slideShowId, onSuccess, onError) {
        console.log("request slideshow");
        request("https://docs.google.com/presentation/d/" + slideShowId + "/pub", function (error, response, body) {
            if (error) {
                console.log("ERR request slideshow ", error);
                onError(error);
                return;
            }
            try {
                onSuccess(body);
            } catch (e) {
                console.log(e);
                onError(e);
            }
        });
    };
}());
