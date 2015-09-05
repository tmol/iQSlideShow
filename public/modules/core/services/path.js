/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('Path', ['$state',
        function ($state) {
            this.getViewUrl = function (view) {
                return $state.current.templateUrl + '/../' + view + '.html';
            };
        }]);
}());