'use strict';

module.exports = function (app) {
	var tags = require('../../app/controllers/tags.server.controller');

	// Slideshows Routes
	app.route('/tags')
		.get(tags.list);

    app.route('/tags/:tag')
		.get(tags.tags);
    app.param("tag", tags.getTags);
};
