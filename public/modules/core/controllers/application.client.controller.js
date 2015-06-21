'use strict';
angular.module('core').controller('ApplicationController', ['$scope', 'Authentication','$rootScope',
	function($scope, Authentication,$rootScope) {
		// This provides Authentication context.
		$scope.onClick = function(){
            $rootScope.$broadcast("onApplicationclick");
        }        
        $scope.keyDown = function($event){
            if ($event.keyCode == 38)
                $rootScope.$broadcast("upArrowPressed");
            else if ($event.keyCode == 39)
                $rootScope.$broadcast("rightArrowPressed");
            else if ($event.keyCode == 40)
                $rootScope.$broadcast("downArrowPressed");
            else if ($event.keyCode == 37)
                $rootScope.$broadcast("leftArrowPressed");
        }
	}
]);