/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('PubNubFacade', ['PubNub',
        function (PubNub) {
            var instance;

            function init(aDeviceId) {

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

                    messageEvent: pubNub.ngMsgEv(theChannel),

                    subscribe : function () {
                        pubNub.ngSubscribe({ channel: theChannel });
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
        }
        ]);
}());