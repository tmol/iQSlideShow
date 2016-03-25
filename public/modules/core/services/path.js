/*global angular*/
(function () {
    'use strict';
    angular.module('core').service('Path', ['$state',
        function ($state) {
            this.getViewUrl = function (view, referenceState) {
                if (referenceState === 'core') {
                    return 'modules/core/templates/' + view + '.html';
                }
                if (referenceState) {
                    referenceState = $state.get(referenceState);
                } else {
                    referenceState = $state.current;
                }
                return referenceState.templateUrl + '/../' + view + '.html';
            };
        }]);
}());
