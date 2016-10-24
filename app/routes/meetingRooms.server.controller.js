/*jslint nomen: true, vars: true, unparam: true*/
/*global module, require*/
(function () {
    'use strict';

    module.exports = function (app) {
        var rooms = require('../../app/controllers/meetingRooms.server.controller');

        app.route('/meeting-rooms')
           .get(rooms.list);
    };
}());
