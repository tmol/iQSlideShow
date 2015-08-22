var messageEngineFactory = require('../modules/messaging/messagingEngineFactory'),
    lodash = require('lodash');

exports.connectedDevicesSingleton = (function () {
    'use strict';
    var instance;

    function init() {
        return {
            init : function () {
                var devices = [],
                    device;

                function messageReceived(message) {
                    console.log('Action is ' +  message.action + ' for device with id: ' + message.id + ' playing slideshow ' + message.slideShowId);
                    if (message.action === 'presence') {
                        var existingDeviceIndex = lodash.findIndex(devices, function (device) {
                            return devices.id === message.id;
                        });
                        device = { id : message.id, slideShowId : message.slideShowId };
                        if (existingDeviceIndex !== 0) {
                            device = devices[existingDeviceIndex];
                        }
                    }

                    messageEngineFactory.initEngine(messageReceived);
                }
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };
})();