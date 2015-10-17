(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller');
        var slidesRepository = require('../../app/controllers/slidesRepository.server.controller');

        app.route('/repository/slides')
            .post(users.requiresLogin, slidesRepository.storeByName);

        app.route('/repository/slides/:slideId')
            .get(slidesRepository.renderSlide);

        app.param("slideId", slidesRepository.getSlideById);
    };
}());
