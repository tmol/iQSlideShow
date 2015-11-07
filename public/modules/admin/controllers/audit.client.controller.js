/*global angular, alert*/
(function () {
    'use strict';

    angular.module('admin').controller('AuditController', ['$scope', 'Admin',
        function ($scope, Admin) {

            $scope.downloadAuditData = function () {
                return true;
            };

            $scope.fromDateStatus = {
                opened : false
            };
            $scope.toDateStatus = {
                opened : false
            };
            $scope.fromDate = new Date();
            $scope.toDate = new Date();

            $scope.openPopupFromDate = function ($event) {
                $scope.fromDateStatus.opened = true;
            };

            $scope.openPopupToDate = function ($event) {
                $scope.toDateStatus.opened = true;
            };
        }]);
}());
