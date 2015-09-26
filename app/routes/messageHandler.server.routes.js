/*jslint nomen: true, vars: true, unparam: true*/
/*global module, require*/
(function () {
    'use strict';

    module.exports = function (app) {
        var messageHandler = require('../../app/controllers/messageHandler.server.controller');
        // Devices Routes
        app.route('/message')
            .post(messageHandler.messageReceived);
    };
}());
