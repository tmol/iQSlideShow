/*global require, exports*/

var pubNub = require('./pubNub');

exports.init = function (messageReceivedCallback) {
    'use strict';
    var pubNubInstance = pubNub.getInstance().init(messageReceivedCallback);
    return pubNubInstance;
};