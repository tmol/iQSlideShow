(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var _ = require('lodash'),
        request = require('request'),
        errorHandler = require('./errors.server.controller');

    exports.list = function (req, res) {
        var endpoint = req.query.endpoint;
        var username = req.query.username;
        var password = req.query.password;

        if (!endpoint || !username || !password) {
            return res.status(400).send({
                message: 'Missing API endpoint or credentials'
            });
        }

        var options = {
            url: endpoint,
            auth: {
                user: username,
                pass: password
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
