/*jslint nomen: true, vars: true, unparam: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var messageHandler = require('../services/messaging/messageHandler');

    /**
     * Create a Device
     */
    exports.messageReceived = function (req, res) {
        var message = req.body;
        messageHandler.handleMessage(message).then(function (result) {
            res.jsonp(result);
        }, function (errorMessage) {
            res.status(400).send({
                message: errorMessage
            });
        });
    };

}());
