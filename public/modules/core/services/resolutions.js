/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('core').service('resolutions',
        function () {
            return [
                {width: 640, height: 360},
                {width: 960, height: 540},
                {width: 1024, height: 576},
                {width: 1280, height: 720},
                {width: 1600, height: 900},
                {width: 1920, height: 1080},
                {width: 2048, height: 1152},
                {width: 2560, height: 1440},
                {width: 3200, height: 1800},
                {width: 3840, height: 2160},
                {width: 4096, height: 2304},
                {width: 5120, height: 2880},
                {width: 7680, height: 4320},
                {width: 8192, height: 4608}
            ];
        });
}());
