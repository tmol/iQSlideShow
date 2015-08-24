var messageEngineFactory = require('../modules/messaging/messagingEngineFactory'),
    lodash = require('lodash');

exports.connectedDevicesSingleton = (function () {
    'use strict';

    var instance;

    function init() {

        var devices = [],
            device;

        return {

            devices : devices,

            init : function () {
                messageEngineFactory.initEngine(messageReceived);

                function messageReceived(message) {
                    console.log('Action is ' +  message.action + ' for device with id: ' + message.id + ' playing slideshow ' + message.slideShowId);
                    if (message.action === 'presence') {
                        var existingDeviceIndex = lodash.remove(devices, function (device) {
                            return device.id === message.id;
                        });
                        device = { id : message.id, slideShowId : message.slideShowId };
                        devices.push(device);
                        console.log('number of devices: ' + devices.length);
                    }
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