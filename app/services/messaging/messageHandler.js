/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    var messagingEngineFactory = require('./messagingEngineFactory'),
        mongoose = require('mongoose'),
        Device = mongoose.model('Device'),
        errorHandler = require('../../controllers/errors.server.controller'),
        fs = require('fs'),
        actionsChache = {},
        messagingEngine;

    var getAction = function (action, callBack) {

        if (actionsChache[action]) {
            callBack(actionsChache[action]);
            return;
        }

        fs.exists('app/services/messaging/actions/' + action + '.js', function (result) {
            if (result) {
                actionsChache[action] = require('./actions/' + action);
                callBack(actionsChache[action]);
                return;
            }
            console.log("No action found for: " + action);
        });

    };

    var onMessageReceived = function (message) {
        console.log("Message received with action: " + message.action);

        getAction(message.action, function (action) {
            console.log('messageHandler.messagingEngine = ' + messagingEngine);
            action(messagingEngine, message);
        });
    };

    exports.publish = function (action, deviceId, content) {
        messagingEngine.publish({
            action: action,
            deviceId: deviceId,
            content: content
        });
    };

    exports.init = function () {
        messagingEngine = messagingEngineFactory.init(onMessageReceived);
        messagingEngine.subscribe(onMessageReceived);
        console.log('messagingEngine ' + messagingEngine);
    };
}());
