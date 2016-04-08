/*global angular*/
(function () {
    'use strict';

    angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'Slideshows', 'ActionResultDialogService',
        function ($scope, $stateParams, $location, Authentication, Admin, Slideshows, ActionResultDialogService) {
            $scope.authentication = Authentication;

            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            $scope.update = function () {
                var config = $scope.config;

                config.$updateConfig(function () {
                    ActionResultDialogService.showOkDialog('Update succeeded', $scope);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.getConfig = function () {
                Admin.getConfig(function (config) {
                    $scope.config = config;
                });
            };
        }
                                                          ]);

}());
