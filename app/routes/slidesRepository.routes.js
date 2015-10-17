(function () {
    'use strict';

    module.exports = function (app) {
        var slidesRepository = require('../../app/controllers/slidesRepository.server.controller');

        app.route('/repository/slides')
            .post(slidesRepository.save);

        app.route('/repository/slides/:slideId')
            .get(slidesRepository.renderSlide);

        app.param("slideId", slidesRepository.getSlideById);
    };
}());
