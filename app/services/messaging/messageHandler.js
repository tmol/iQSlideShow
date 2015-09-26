/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    var messagingEngineFactory = require('./messagingEngineFactory'),
        fs = require('fs'),
        actionsChache = {},
        Promise = require('promise'),
        messagingEngine;

    var getAction = function (action) {

        var findAction = new Promise(function (resolve, error) {
            if (actionsChache[action]) {
                resolve(actionsChache[action]);
                return;
            }

            fs.exists('app/services/messaging/actions/' + action + '.js', function (result) {
                if (result) {
                    actionsChache[action] = require('./actions/' + action);
                    resolve(actionsChache[action]);
                    return;
                }
                console.log('No action found for: ' + action);
                error('No action found for: ' + action);
            });
        });
        return findAction;
    };

    var onMessageReceived = function (message) {
        console.log('Message received with action: ' + message.action);
        var response = new Promise(function (resolve, error) {
            getAction(message.action).then(function (action) {
                action(messagingEngine, message, resolve, error);
            }, error);
        });
        return response;
    };

    exports.handleMessage = function (message) {
        return onMessageReceived(message);
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
        messagingEngine.subscribeToServerChannel(onMessageReceived);
        console.log('messagingEngine ' + messagingEngine);
    };
}());
