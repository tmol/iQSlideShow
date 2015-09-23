'use strict';

angular.module('admin').controller('ReloadController', ['$scope', 'Admin',
	function($scope, Admin) {
		 $scope.reload = function () {
             Admin.reload(function(res) {
                 $scope.reloadedDevices = res.reloadedDevices;
             });
         };
	}
]);