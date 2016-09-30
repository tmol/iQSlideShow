/*global angular, alert*/
(function () {
    'use strict';

    angular.module('admin').controller('AuditController', ['$scope', '$location', 'Authentication', 'Admin', 'ActionResultDialogService',
        function ($scope, $location, Authentication, Admin, ActionResultDialogService) {
            // If user is not signed in then redirect back home
            if (!Authentication.user) $location.path('/');


            $scope.fromDate = new Date();
            $scope.toDate = new Date();

            $scope.validateDates = function (validationSuccesfullCallback) {
                var currentDate = new Date(),
                    warningMessage;
                if (!$scope.fromDate) {
                    warningMessage = "Please specify a valid 'From date'.";
                } else if (!$scope.toDate) {
                    warningMessage = "Please specify a valid 'To date'.";
                } else if ($scope.fromDate > currentDate) {
                    warningMessage = "'From date' is bigger than the current date.";
                } else if ($scope.fromDate > $scope.toDate) {
                    warningMessage = "'From date' bigger than 'To date'.";
                }

                if (warningMessage) {
                    ActionResultDialogService.showWarningDialog(warningMessage, $scope);
                    return false;
                }

                return true;
            };

            $scope.downloadAuditData = function () {
                if ($scope.validateDates()) {
                    $scope.downloadUrl = '/audits/csv?startDate=' + $scope.fromDate.toDateString() + '&endDate=' + $scope.addOneDayToDateToDateString($scope.toDate);
                }
            };

            $scope.downloadUrl = '';

            $scope.fromDateStatus = {
                opened : false
            };

            $scope.toDateStatus = {
                opened : false
            };

            $scope.openPopupFromDate = function ($event) {
                $scope.fromDateStatus.opened = true;
            };

            $scope.openPopupToDate = function ($event) {
                $scope.toDateStatus.opened = true;
            };

            $scope.addOneDayToDateToDateString = function (date) {
                var res = new Date(date);
                res.setDate(date.getDate() + 1);
                return res.toDateString();
            };

            $scope.$watch('fromDate', function (newValue, oldValue) {
                $scope.downloadUrl = '';
            });

            $scope.$watch('toDate', function (newValue, oldValue) {
                $scope.downloadUrl = '';
            });

        }]);
}());
