'use strict';

angular.module('admin').controller('ReloadController', ['$scope', '$location', 'Authentication', 'Admin',
	function($scope, $location, Authentication, Admin) {
        // If user is not signed in then redirect back home
        if (!Authentication.user) $location.path('/');

		 $scope.reload = function () {
             Admin.reload(function(res) {
                 $scope.reloadedDevices = res.reloadedDevices;
             });
         };
	}
]);