(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Promise = require("promise"),
        Slide = require("./slide.server.model"),
        Tag = require("./tag.server.model"),
        Schema = mongoose.Schema;

    var SlideshowSchema = new Schema({
        name: {
            type: String,
            default: '',
            required: 'Please fill Slideshow name',
            trim: true
        },
        published: {
            type: Boolean,
            default: false
        },
        slides: [Slide.schema],
        draftSlides: [Slide.schema],
        tags: {
            type: [String],
            index: true
        },
        created: {
            type: Date,
            default: Date.now
        },
        modified: {
            type: Date,
            default: Date.now
        },
        publishedOnDate: {
            type: Date,
            default: Date.now
        },
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        }
    });

    SlideshowSchema.pre('save', function (next) {
        var promises = [];
        this.tags.forEach(function (tag) {
            var promise = new Promise(function (resolve, reject) {
                Tag.addTag(tag, resolve, reject);
            });
            promises.push(promise);
        });

        Promise.all(promises).then(function (results) {
            next();
        }, function (error) {
            console.log(error);
            next(error);
        });
    });

    SlideshowSchema.statics.findByName = function (name, onSuccess, onError) {
        this.find({name: name}).populate('_id', 'name').exec(function (err, slideShows) {
            if (err) {
                onError(err);
            } else {
                onSuccess(slideShows);
            }
        });
    }

    mongoose.model('Slideshow', SlideshowSchema);
}());
