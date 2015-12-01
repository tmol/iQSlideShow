/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function() {
    'use strict';
    var request = require('request');
        exports.loadSlides = function(slideShowId, onSuccess, onError) {
            console.log("request slideshow");
            request("https://docs.google.com/presentation/d/"+slideShowId+"/pub", function(error, response, body) {
                if (error) {
                    console.log("ERR request slideshow " , error);
                    onError(error);
                    return;
                }
                try{
                    console.log("DO regex" , error);
                    var regex = /(\\x3csvg version)(?:[^])*?(\\x3c\\\/svg)/g;
                    var result = body.match(regex);
                    var numberOfSlide = result.length;
                    for (var i=1;i<result.length;i++) {
                        console.log(result[i]==result[i-1]);
                    }
                    console.log(numberOfSlide);

                    onSuccess(result);
                }catch(e){
                    console.log(e);
                    onError(e);
                }
            });
        };
}());
