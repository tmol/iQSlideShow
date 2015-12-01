/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function() {
    'use strict';

    var mongoose = require('mongoose'),
        Slideshow = mongoose.model('Slideshow'),
        Slide = mongoose.model('Slide'),
        explodeGoogleSlide = require('../../explodeGoogleSlide'),
        async = require('async'),
        lodash = require('lodash'),
        Device = mongoose.model('Device');

    module.exports = function(messagingEngine, message, resolvePublish, errorPublish) {
        console.log("Handling publishSlide message, slideShowId: " + message.slideShowId);

        console.log("searching for slideShow: " + message.slideShowId);
        Slideshow.findById(message.slideShowId).exec(function(err, slideShow) {
            if (err) {
                errorPublish(err);
                return;
            }
            if (!slideShow) {
                errorPublish("Slideshow not found!");
                return;
            }
            console.log("found");
            slideShow.slides = slideShow.draftSlides.filter(function(slide) {
                return !slide.hidden;
            });
            //TODO: make this a middleware
            //in case on supporting other
            var explodeSlides = [];
            for (var i = 0; i < slideShow.slides.length; i++) {
                var slide = slideShow.slides[i];
                if (slide.templateName == "GoogleSlideShow") {
                    explodeSlides.push(function(callback) {
                        explodeGoogleSlide.explodeSlide(slide, function(result) {
                            if (result) {
                                slide.exploded = result;
                            }
                            callback(null);
                        }, callback);
                    });
                }
            }
            console.log("exec async");
            async.parallel(explodeSlides, function() {
                console.log("executed");
                var explodedSlides = [];
                for (var i = 0; i < slideShow.slides.length; i++) {
                    var slide = slideShow.slides[i];
                    if (slide.exploded) {
                        console.log("Exploded ",slide.exploded.length);
                        slide.exploded.forEach(function(item) {
                            var newslide = {
                                slideNumber : 0,
                                "slideShowId" : slide.slideShowId,
                                "resolution" : lodash.extend({}, slide.resolution),
                                "hidden" : slide.hidden,
                                "content" : {
                                    "content" : item
                                },
                                "detailsUrl" : slide.detailsUrl,
                                "animationType" : slide.animationType,
                                "zoomPercent" : slide.zoomPercent,
                                "durationInSeconds" : slide.durationInSeconds,
                                "templateName" : slide.templateName
                            };
                            //newslide.content = {content:item};
                            delete newslide.exploded;

                            explodedSlides.push(newslide);
                        });

                        continue;
                    }
                    explodedSlides.push(slide);
                }

                slideShow.slides = explodedSlides;

                //reindex slides because of the hidden one;
                slideShow.slides.forEach(function(slide, index) {
                    slide.slideNumber = index + 1;
                    slide.slideShowId = slideShow._id;

                });

                slideShow.save(function(err) {
                    if (err) {
                        console.log("Error when saving ", err);
                        errorPublish(err);
                        return;
                    }
                    var oid = new mongoose.Types.ObjectId(slideShow._id);

                    (function notifyDevicesAboutPublish() {
                        Device.find({
                            "slideAgregation.playList.slideShow": oid
                        }, function(err, devices) {
                            if (err) {
                                errorPublish(err);
                                return;
                            }
                            console.log(devices.length);
                            devices.forEach(function(device) {
                                device.sendDeviceSetupMessage();
                            });
                        });
                    }());

                    resolvePublish();
                });
            });

        });
    };
}());
