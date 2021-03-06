'use strict';

module.exports = function (app) {
	var users = require('../../app/controllers/users.server.controller');
	var slideshows = require('../../app/controllers/slideshows.server.controller');
    var pptOnline = require('../../app/controllers/pdfProxy.server.controller');

	// Slideshows Routes
	app.route('/slideshows')
		.get(users.requiresLogin, slideshows.list)
        .post(users.requiresLogin, slideshows.create);

	app.route('/slideshows/filter')
		.get(users.requiresLogin, slideshows.list);

	app.route('/slideshows/filterByName')
		.get(users.requiresLogin, slideshows.filterByName);

	app.route('/slideshows/filteredNamesAndTags')
		.get(users.requiresLogin, slideshows.getFilteredNamesAndTags);

    app.route('/slideshows/:slideshowId')
		.get(slideshows.read)
		.put(users.requiresLogin, slideshows.hasAuthorization, slideshows.update)
		.delete(users.requiresLogin, slideshows.hasAuthorization, slideshows.delete);

    app.route('/slideshows/:slideshowId/:slideNumber')
		.get(slideshows.readSlide);

    app.route('/slideshowDevices/:slideshowId')
		.get(slideshows.getDevices)
        .put(users.requiresLogin, slideshows.hasAuthorization, slideshows.setDevices);

	app.route('/templates')
		.get(slideshows.getTemplates);

	app.route('/pdfProxy/:pdfUrl')
		.get(pptOnline.getPdf);
		
	// Finish by binding the Slideshow middleware
	app.param('slideshowId', slideshows.slideshowByID);
    app.param('slideNumber', slideshows.slideByNumber);
};
