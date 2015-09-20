/*global require, exports, module*/
(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller'),
            admin = require('../../app/controllers/admin.server.controller');

        app.route('/admin/config')
            .get(admin.getConfig)
            .put(users.requiresLogin, admin.updateConfig);

        app.route('/admin/reload')
            .get(admin.reload);
    };
}());