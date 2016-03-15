/*global require, exports*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        Promise = require("promise"),
        Tag = require("./tag.server.model"),
        Slide = require("./slide.server.model"),
        SlideBlueprintSchema = new Schema({
            name: {
                type: String,
                default: "",
                index: 1
            },
            tags: {
                type: [String],
                index: true
            },
            slide: [Slide.schema],
            created: {
                type: Date,
                default: Date.now
            },
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            }
        }, {
            collection: 'slideBlueprints'
        });

    SlideBlueprintSchema.pre('save', function (next) {
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
            next(error);
        });
    });
    mongoose.model('SlideBlueprint', SlideBlueprintSchema);
}());
