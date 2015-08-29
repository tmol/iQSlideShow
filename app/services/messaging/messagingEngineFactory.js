/*global require, exports*/

var pubNub = require('./pubNub');

exports.init = function (messageReceivedCallback) {
    'use strict';
    pubNub.getInstance().init(messageReceivedCallback);
};