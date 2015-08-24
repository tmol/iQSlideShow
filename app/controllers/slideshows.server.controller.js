'use strict';

var fs = require('fs');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Slideshow = mongoose.model('Slideshow'),
	_ = require('lodash');

/**
 * Create a Slideshow
 */
exports.create = function(req, res) {
	var slideshow = new Slideshow(req.body);
	slideshow.user = req.user;

	slideshow.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(slideshow);
		}
	});
};

/**
 * Show the current Slideshow
 */
exports.read = function(req, res) {
	res.jsonp(req.slideshow);
};

/**
 * Update a Slideshow
 */
exports.update = function(req, res) {
	var slideshow = req.slideshow ;

	slideshow = _.extend(slideshow , req.body);

	slideshow.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(slideshow);
		}
	});
};

/**
 * Delete an Slideshow
 */
exports.delete = function(req, res) {
	var slideshow = req.slideshow ;

	slideshow.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(slideshow);
		}
	});
};

/**
 * List of Slideshows
 */
exports.list = function(req, res) { 
	Slideshow.find().sort('-created').populate('user', 'displayName').exec(function(err, slideshows) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(slideshows);
		}
	});
};

/**
 * Slideshow middleware
 */
exports.slideshowByID = function(req, res, next, id) { 
	Slideshow.findById(id).populate('user', 'displayName').exec(function(err, slideshow) {
		if (err) return next(err);
		if (! slideshow) return next(new Error('Failed to load Slideshow ' + id));
		req.slideshow = slideshow ;
		next();
	});
};

/**
 * Slideshow authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.slideshow.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.getTemplates = function(req, res) {
    fs.readdir('public/modules/slideshows/slideTemplates', function(err, files) {
        if (err) {
			return res.status(400).send('Canot read templates');
		} else {
			res.jsonp(files);
		}        
    });
}