/*global angular, _*/
(function () {
    'use strict';

    angular.module('core').service('ActionResultDialogService', ['Path', '$uibModal',
        function (Path, $uibModal) {

            var okResult = 'ok';

            function showDialog(templateName, msg, scope, dialogCssStyle, callback) {
                scope.modalDialogMessage = msg;
                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl(templateName, 'core'),
                    windowClass: dialogCssStyle,
                    scope: scope
                }).result.then(function (result) {
                    if (callback) {
                        callback(result);
                    }
                });
            };

            function showDialogWithDefaultStyle(templateName, msg, scope, callback) {
                showDialog(templateName, msg, scope, 'iqss-core-dialog', callback);
            }

            var showOkDialog = function (msg, scope, callback) {
                showDialogWithDefaultStyle('okDialog', msg, scope, callback);
            };

            var showWarningDialog = function (msg, scope, callback) {
                showDialogWithDefaultStyle('warningDialog', msg, scope, callback);
            };

            var showOkCancelDialog = function (confirmationMsg, scope, callback) {
                showDialogWithDefaultStyle('okCancelDialog', confirmationMsg, scope, function (result) {
                    if (result !== okResult) {
                        return;
                    }
                    callback();
                });
            };

            var showErrorDialog = function (errorMsg, errorDetails, scope, callback) {
                scope.errorDetails = errorDetails;
                showDialog('errorDialog', errorMsg, scope, 'iqss-core-error-dialog', function (result) {
                    if (result !== okResult) {
                        return;
                    }
                    callback();
                });
            };

            return {
                showOkDialog: showOkDialog,
                showWarningDialog: showWarningDialog,
                showOkCancelDialog: showOkCancelDialog,
                showErrorDialog: showErrorDialog,
                cancelResult: 'cancel',
                okResult: okResult
            };
        }]);
}());
