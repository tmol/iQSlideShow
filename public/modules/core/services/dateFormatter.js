/*global angular*/
(function () {
    'use strict';

    angular.module('core').factory('DateFormatter', ['$resource',
        function ($resource) {
            return {
                formatDate: function (dateString) {
                    var date = new Date(dateString);
                    var day = date.getDate();
                    if (day < 10) {
                        day = '0' + day;
                    }
                    var month = date.getMonth() + 1;
                    if (month < 10) {
                        month = '0' + month;
                    }
                    return day + '.' + month + '.' + date.getFullYear();
                }
            };
        }]);
}());
