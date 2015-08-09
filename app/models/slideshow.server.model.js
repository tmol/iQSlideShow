'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Slideshow', SlideshowSchema);