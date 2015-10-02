'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Promise = require("Promise"),
    SlideShowTagSchema = require("./slideShowTag.server.model"),
    SlideShowTag = mongoose.model("SlideShowTag"),
	Schema = mongoose.Schema;

/**
 * Slideshow Schema
 */
var SlideSchema = new Schema ({
	templateName : {
		type: String,
		default: '',
		trim: true
	},
	durationInSeconds : {
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
	animationType : {
		type: String,
		default: '',
		required: 'Please fill the Animaion type',
		trim: true
	},
    detailsUrl : {
		type: String,
		default: '',
		trim: true
	},
	content : {
		type: Object,
		default: {}
	},
    hidden : {
        type: Boolean,
        default: false
    },
    slideShowId : {
        type: Schema.ObjectId
    },
    slideNumber : {
        type: Number
    }
});

var SlideshowSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Slideshow name',
		trim: true
	},
    slides: [SlideSchema],
    draftSlides: [SlideSchema],
    tags:{
        type:[String],
        index: true
    },
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

SlideshowSchema.pre('save', function(next) {
    var promises = [];
    this.tags.forEach(function(tag) {
        var promise = new Promise(function (resolve, reject) {
            SlideShowTag.addTag(tag, resolve, reject);
        });
        promises.push(promise);
    });

    Promise.all(promises).then(function (results) {
        next();
    },function(error) {
        next(error);
    });
});

mongoose.model('Slideshow', SlideshowSchema);
