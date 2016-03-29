/*global angular, _*/
(function () {
    'use strict';

    angular.module('core').service('ActionResultDialogService', ['Path', '$uibModal',
        function (Path, $uibModal) {

            var showOkDialog = function (msg, scope) {
                scope.okModalMessage = msg;
                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('okDialog', 'core'),
                    windowClass: 'iqss-core-okDialog',
                    scope: scope
                });
            };

            return {
                showOkDialog: showOkDialog
            };
        }]);
}());
