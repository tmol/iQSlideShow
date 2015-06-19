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
		required: 'Please fill the Template name',
		trim: true
	},
	durationInSeconds : {
		type: Number,
		default: 3,
		required: 'Please fill the Duration in seconds',
		trim: true
	},
	animationType : {
		type: String,
		default: '',
		required: 'Please fill the Animaion type',
		trim: true
	}
});

var SlideshowSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Slideshow name',
		trim: true
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

mongoose.model('Slideshow', SlideshowSchema);