/*global angular*/
var pubNubEngine = (function () {
    'use strict';

    var instance;

    function init(PubNub, aDeviceId) {

        var pubNub = PubNub,
            deviceId = aDeviceId,
            theChannel = 'iQSlideShow';

        PubNub.init({
            publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
            subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
            uuid : deviceId,
            ssl : true
        });

        return {

            subscribe : function (scope, callback) {
                pubNub.ngSubscribe({ channel: theChannel });

                scope.$on(pubNub.ngMsgEv(theChannel), function (event, payload) {
                    callback(event, payload);
                });
            },

            publish : function (action, content) {

                pubNub.ngPublish({
                    channel: theChannel,
                    message: {
                        action : action,
                        deviceId  : deviceId,
                        content : content
                    }
                });
            }
        };
    }

    return {
        getInstance: function (PubNub, deviceId) {
            if (!instance) {
                instance = init(PubNub, deviceId);
            }

            return instance;
        }
    };
}());