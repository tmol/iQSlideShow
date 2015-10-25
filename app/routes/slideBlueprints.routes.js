(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller');
        var slideBlueprints = require('../../app/controllers/slideBlueprints.server.controller');

        app.route('/slideBlueprints/slides')
            .post(users.requiresLogin, slideBlueprints.storeByName);

        app.route('/slideBlueprints/slides/:slideId')
            .get(slideBlueprints.renderSlide);

        app.route('/slideBlueprints/slides/byFilter')
            .post(slideBlueprints.getSlideByFilter);

        app.param("slideId", slideBlueprints.getSlideById);
    };
}());
