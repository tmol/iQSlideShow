/*global require, exports, module*/
(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller'),
            config = require('../../app/controllers/config.server.controller'),
            reload = require('../../app/controllers/reload.server.controller'),
            locations = require('../../app/controllers/locations.server.controller');

        app.route('/admin/config')
            .get(config.getConfig)
            .put(users.requiresLogin, config.updateConfig);

        app.route('/admin/reload')
            .get(reload.reload);

        // Location Routes
        app.route('/admin/location')
            .get(locations.list)
            .post(users.requiresLogin, locations.create);

        app.route('admin/location/:locationId')
            .put(users.requiresLogin, locations.hasAuthorization, locations.update)
            .delete(users.requiresLogin, locations.hasAuthorization, locations.delete);
    };
}());