(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller');
        var audits = require('../../app/controllers/audits.server.controller');

        app.route('/audits')
            .get(audits.list)
            .post(users.requiresLogin, audits.create);
        app.route('/audits/csv')
            .get(audits.csv);
    };
}());
