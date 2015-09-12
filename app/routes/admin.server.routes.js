/*global require, exports, module*/
(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller'),
            admin = require('../../app/controllers/admin.server.controller');

        app.route('/admin')
            .get(admin.getConfig)
            .put(users.requiresLogin, admin.updateConfig);
    };
}());