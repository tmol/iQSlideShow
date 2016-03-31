/*global angular, _*/
(function () {
    'use strict';

    angular.module('core').service('ActionResultDialogService', ['Path', '$uibModal',
        function (Path, $uibModal) {

            var showDialog = function (templateName, msg, scope, callback) {
                scope.modalDialogMessage = msg;
                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl(templateName, 'core'),
                    windowClass: 'iqss-core-dialog',
                    scope: scope
                }).result.then(function (result) {
                    if (callback) {
                        callback(result);
                    }
                });
            };

            var showOkDialog = function (msg, scope, callback) {
                showDialog('okDialog', msg, scope, callback);
            };

            var showOkCancelDialog = function (msg, scope, callback) {
                showDialog('okCancelDialog', msg, scope, callback);
            };

            return {
                showOkDialog: showOkDialog,
                showOkCancelDialog: showOkCancelDialog,
                cancelResult: 'cancel',
                okResult: 'ok'
            };
        }]);
}());
