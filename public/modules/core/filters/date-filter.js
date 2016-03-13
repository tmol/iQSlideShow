/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').filter('date', function () {
    'use strict';

    return function (date) {
        if (!date) {
            return "";
        }
        var day = date.getDay();
        var month = date.getMonth();
        var year = date.getFullYear();

        day = (100 + day).toString().substr(1,2);
        month = (100 + month).toString().substr(1,2);
        return day + "." + month + "." + year;
    };
});
