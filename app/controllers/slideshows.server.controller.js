'use strict';

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

exports.getMock = function(req, res) {

	res.json({slides:[
			{
				title:"Slide one",
				content:"Bla bla bla bla",
				animation:'enter-left',
				image:'http://images.clipartpanda.com/teacher-apple-border-clipart-KTjgkqLTq.jpeg',
				duration:5000
			},
			{
				title:"Slide two",
				content:"This is the seccond slide, looks nice",
				animation:'enter-left',
				image:'http://www.wellclean.com/wp-content/themes/artgallery_3.0/images/car3.png',
				duration:2000
			},
			{
				title:"Slide number three",
				content:"This is the third slide",
				animation:'enter-bottom',
				image:'http://www.billboard.com/files/styles/promo_650/public/media/lady-gaga-2013-650-430d.jpg?itok=-ljxT5uP',
				template:'anotherTemplate',
				duration:2000
			}		
		]}
		)
};