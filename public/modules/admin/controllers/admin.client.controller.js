/*global angular*/
(function () {
    'use strict';

    angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'Slideshows',
        function ($scope, $stateParams, $location, Authentication, Admin, Slideshows) {
            $scope.authentication = Authentication;

            Slideshows.query(function (res) {
                $scope.slideshows = res;
            });

            // Update existing Admin
            $scope.update = function () {
                var admin = $scope.admin;

                admin.$update(function () {
                    $location.path('/');
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.getConfig = function () {
                $scope.admin = Admin.get();
            };
        }
        ]);
}());
