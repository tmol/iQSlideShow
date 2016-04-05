/*global require*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    /**
     * Slide Schema
     */
    var SlideSchema = new Schema({
        title: {
            type: String,
            default: '',
            trim: true
        },
        templateName: {
            type: String,
            default: '',
            trim: true
        },
        durationInSeconds: {
            type: Number,
            default: 3,
            required: 'Please fill the Duration in seconds',
            trim: true
        },
        zoomPercent: {
            type: Number,
            default: 100,
            required: 'Please fill the zoom percent',
            trim: true
        },
        animationType: {
            type: String,
            default: '',
            required: 'Animation type required.',
            trim: true
        },
        detailsUrl: {
            type: String,
            default: '',
            trim: true
        },
        content: {
            type: Object,
            default: {}
        },
        hidden: {
            type: Boolean,
            default: false
        },
        slideShowId: {
            type: Schema.ObjectId
        },
        slideNumber: {
            type: Number
        },
        resolution: {
            width: {type: Number, default: 960},
            height: {type: Number, default: 540}
        },
        slideShowName: {
            type: String,
            default: ''
        },
        author: {
            type: String,
            default: ''
        },
        publishedOnDate: {
            type: String,
            default: ''
        }
    });

    mongoose.model('Slide', SlideSchema);
    module.exports = mongoose.model('Slide');
}());
