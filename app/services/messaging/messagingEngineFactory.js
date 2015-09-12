/*global require, exports*/

var pubNub = require('./pubNub');

exports.init = function () {
    'use strict';
    var pubNubInstance = pubNub.getInstance().init();
    return pubNubInstance;
};