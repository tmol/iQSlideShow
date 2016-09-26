'use strict';

module.exports = function (app) {
	var users = require('../../app/controllers/users.server.controller');
	var slideshows = require('../../app/controllers/slideshows.server.controller');
    var pptOnline = require('../../app/controllers/pdfProxy.server.controller');

	app.route('/deviceInteraction/slideshows/filter')
		.get(slideshows.listPublished);

	app.route('/deviceInteraction/slideshows/filterByName')
		.get(slideshows.filterPublishedByName);
};
