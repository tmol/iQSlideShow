'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Device Schema
 */
var DeviceSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Device name',
		trim: true
	},
    location: {
		type: String,
		default: '',
		required: 'Please fill Device location',
		trim: true
	},
    defaultSlideShowId: {
		type: Schema.ObjectId,
		ref: 'Slideshow',
        required: 'Please select default slideshow.',
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

mongoose.model('Device', DeviceSchema);