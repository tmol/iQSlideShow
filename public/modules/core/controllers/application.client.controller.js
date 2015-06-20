'use strict';
angular.module('core').controller('ApplicationController', ['$scope', 'Authentication','$rootScope',
	function($scope, Authentication,$rootScope) {
		// This provides Authentication context.
		$scope.onClick = function(){
            $rootScope.$broadcast("onApplicationclick");
        }
	}
]);