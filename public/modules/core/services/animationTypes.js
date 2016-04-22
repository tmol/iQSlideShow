/*global angular*/
(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint
    angular.module('core').service('animationTypes',
        function () {
            return ["enter-left", "enter-right", "enter-bottom", "enter-top"];
        });
}());
