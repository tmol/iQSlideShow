(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var _ = require('lodash'),
        config = require('../../config/config'),
        request = require('request'),
        errorHandler = require('./errors.server.controller');

    exports.list = function (req, res) {
        var endpoint = config.meetingRooms.endpoint;
        var username = config.meetingRooms.username;
        var password = config.meetingRooms.password;

        var options = {
            url: config.meetingRooms.endpoint,
            auth: {
                user: config.meetingRooms.username,
                pass: config.meetingRooms.password
            },
            json: true
        };

        request.get(options, function(err, response, body) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var rooms = _.map(body, function(room) {
                return {
                    name: room.roomName,
                    city: room.city,
                    building: room.building,
                    status: room.status.toLowerCase().replace('_', '-')
                };
            });

            rooms = _.sortBy(rooms, 'name');

            res.jsonp(rooms);
        });
    };
}());