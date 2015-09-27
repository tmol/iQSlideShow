'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	SlideShowTag = mongoose.model("SlideShowTag");

exports.tags = function(req, res, tag) {
    res.jsonp(req.tags);
}
exports.list = function(req, res) {
    SlideShowTag.find({}).sort({value:1}).limit(100).exec( function(err, tags) {
        if (err) return res.status(400).send(err);
		if (!tags) return res.status(400).send('Failed to load tags');
		res.jsonp(tags);
    });
}
exports.getTags = function(req, res, next, tag) {
    SlideShowTag.find({value:{$regex:new RegExp("^"+tag)}}).sort({value:1}).limit(100).exec( function(err, tags) {
        if (err) return next(err);
		if (!tags) return next(new Error('Failed to load tags '));
		req.tags = tags;
		next();
    });
}
