/*jslint nomen: true, vars: true*/
/*global require, exports, console, module*/
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        Slideshow = mongoose.model('Slideshow'),
        Device = mongoose.model('Device');

    module.exports = function (messagingEngine, message, resolvePublish, errorPublish) {
        console.log("Handling publishSlide message, slideShowId: " + message.slideShowId);

        console.log("searching for slideShow: " + message.slideShowId);
        Slideshow.findById(message.slideShowId).populate('user').exec(function (err, slideShow) {
            if (err) {
                errorPublish(err);
                return;
            }
            if (!slideShow) {
                errorPublish("Slideshow not found!");
                return;
            }

            slideShow.slides = slideShow.draftSlides.filter(function (slide) {
                return !slide.hidden;
            });

            slideShow.published = true;
            slideShow.publishedOnDate = new Date();

            //reindex slides because of the hidden one;
            slideShow.slides.forEach(function (slide, index) {
                slide.slideNumber = index + 1;
                slide.slideShowId = slideShow._id;

                slide.slideShowName = slideShow.name;
                slide.author = slideShow.user ? slideShow.user.displayName : "";
                slide.publishedOnDate = slideShow.publishedOnDate;
            });

            slideShow.save(function (err) {
                if (err) {
                    console.log("Error when saving ", err);
                    errorPublish(err);
                    return;
                }
                var oid = new mongoose.Types.ObjectId(slideShow._id);

                (function notifyDevicesAboutPublish() {
                    Device.find({
                        "slideAgregation.playList.slideShow": oid
                    }, function (err, devices) {
                        if (err) {
                            errorPublish(err);
                            return;
                        }
                        console.log(devices.length);
                        devices.forEach(function (device) {
                            device.sendDeviceSetupMessage();
                        });
                    });
                }());

                resolvePublish();
            });
        });
    };
}());
