(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller');
        var slideBlueprints = require('../../app/controllers/slideBlueprints.server.controller');

        app.route('/slideBlueprints/slides')
            .post(users.requiresLogin, slideBlueprints.storeByName);

        app.route('/slideBlueprints/slides/:slideId')
            .get(slideBlueprints.renderSlide)
            .delete(users.requiresLogin, slideBlueprints.delete);

        app.route('/slideBlueprints/slidesByFilter')
            .get(users.requiresLogin, slideBlueprints.getSlideByFilter);

        app.route('/slideBlueprints/filteredNamesAndTags')
            .get(users.requiresLogin, slideBlueprints.getFilteredNamesAndTags);

        app.param("slideId", slideBlueprints.getSlideById);
    };
}());
