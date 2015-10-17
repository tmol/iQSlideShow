/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('admin').directive('deviceLocationsFilterSummary', function () {
    'use strict';

    function link(scope, element, attrs) {
        scope.remove = function () {
            scope.removeLocationFromFilter(location);
            scope.$root.$broadcast('filterDevices');
        };
    }

    return {
        restrict: 'A',
        link: link,
        transclude: true,
        templateUrl: 'modules/devices/templates/deviceLocationsFilterSummary.html',
        scope: {
            location: '=',
            removeLocationFromFilter: '&'
        }
    };
});