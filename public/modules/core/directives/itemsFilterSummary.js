/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('itemsFilterSummary', function () {
    'use strict';

    function link(scope, element, attrs) {
        scope.remove = function (item) {
            scope.filterParameters.removeItemFromFilter(item);
            scope.$root.$broadcast(scope.filterParameters.filterEventName);
        };
    }

    return {
        link: link,
        transclude: true,
        templateUrl: 'modules/core/templates/itemsFilterSummary.html',
        scope: {
            filterParameters: '='
        }
    };
});
