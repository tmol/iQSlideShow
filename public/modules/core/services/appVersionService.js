/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('AppVersionService', [
        function () {
            this.getVersion = function () {
                return version;
            };
        }]);
}());