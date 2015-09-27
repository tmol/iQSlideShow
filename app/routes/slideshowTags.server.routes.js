'use strict';

module.exports = function (app) {
	var slideshowTags = require('../../app/controllers/slideshowTags.server.controller');

	// Slideshows Routes
	app.route('/slideshowtags')
		.get(slideshowTags.list);

    app.route('/slideshowtags/:tag')
		.get(slideshowTags.tags);
    app.param("tag", slideshowTags.getTags);
};
