/*global require, exports*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        SlideShowTagSchema = new Schema({
            value: {
                type: String,
                default: 1,
                index: 1
            }
        }, {collection: 'slideShowTags'});

    SlideShowTagSchema.statics.addTag = function (tag, resolve, reject) {
        var SlideShowTag = mongoose.model("SlideShowTag");

        //if no tag is found, than insert the new one
        SlideShowTag.findOne({value: tag}, function (err, existingTag) {

            if (err) {
                reject(err);
                return;
            }
            if (existingTag) {
                resolve(tag);
                return;
            }

            var slideShowTag = new SlideShowTag({value: tag});
            slideShowTag.save(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(tag);
            });
        });
    };

    mongoose.model('SlideShowTag', SlideShowTagSchema);
}());
