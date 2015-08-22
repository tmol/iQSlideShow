var pubNub = require('./pubNub'),
    channelName = 'iQSlideShow';

exports.initEngine = function (messageReceivedCallback) {
    'use strict';
	return pubNub.init(channelName, messageReceivedCallback);
};