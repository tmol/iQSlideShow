'use strict';

module.exports = function (app) {
	var users = require('../../app/controllers/users.server.controller');
	var slideshows = require('../../app/controllers/slideshows.server.controller');

	// Slideshows Routes
	app.route('/slideshows')
		.get(users.requiresLogin, slideshows.list)
		.post(users.requiresLogin, slideshows.create);

	app.route('/slideshows/:slideshowId')
		.get(slideshows.read)
		.put(users.requiresLogin, slideshows.hasAuthorization, slideshows.update)
		.delete(users.requiresLogin, slideshows.hasAuthorization, slideshows.delete);

    app.route('/slideshows/:slideshowId/:slideNumber')
		.get(slideshows.readSlide);

    app.route('/slideshowDevices/:slideshowId')
		.get(slideshows.getDevices)
        .put(users.requiresLogin, slideshows.hasAuthorization, slideshows.setDevices)

	app.route('/templates')
		.get(slideshows.getTemplates);
		
	// Finish by binding the Slideshow middleware
	app.param('slideshowId', slideshows.slideshowByID);
    app.param('slideNumber', slideshows.slideByNumber);
};
