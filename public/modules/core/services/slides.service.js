/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('core').factory('Slides', ['$resource',
        function ($resource) {
            return {
                get: function (params, callback, onError) {
                    return $resource('/slideshows/:slideId/:slideNumber', {slideId: '@_id', slideNumber : '@slideNumber'}).get(params, callback, onError);
                },
                getSlidesForDevice: function (params, callback) {
                    return $resource('/devices/:deviceId/slides', {deviceId: '@deviceId'}).query(params, callback);
                }
            };
        }]);
}());
