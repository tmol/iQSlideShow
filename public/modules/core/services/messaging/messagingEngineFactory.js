/*global angular*/
(function () {
    'use strict';

    //Devices service used to communicate Devices REST endpoints
    angular.module('core').factory('MessagingEngineFactory', ['PubNubFacade',
        function (PubNubFacade) {
            return {
                getEngine : function () {
                    return PubNubFacade.getInstance();
                }
            };
        }]);
}());