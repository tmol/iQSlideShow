'use strict';
angular.module('core').controller('ApplicationController', ['$scope', 'Authentication','$rootScope',
	function($scope, Authentication,$rootScope) {
		// This provides Authentication context.
        $scope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){
            $scope.noHeader = toState.noApplicationHeader||false;
            $scope.interactionMode = toState.interactionMode||false;
        });

        $scope.keyDown = function($event){
            if ($event.keyCode === 38)
                $rootScope.$broadcast('upArrowPressed');
            else if ($event.keyCode === 39)
                $rootScope.$broadcast('rightArrowPressed');
            else if ($event.keyCode === 40)
                $rootScope.$broadcast('downArrowPressed');
            else if ($event.keyCode === 37)
                $rootScope.$broadcast('leftArrowPressed');
        };

        $scope.$on("ShowLoaderIndicator", function () {
            $scope.loaderIndicatorVisible = true;
        });

        $scope.$on("HideLoaderIndicator", function () {
            $scope.loaderIndicatorVisible = false;
        });

        $scope.swipeLeft = function(){
            $rootScope.$broadcast('rightArrowPressed');
        };

        $scope.swipeRight = function(){
            $rootScope.$broadcast('leftArrowPressed');
        };

        $scope.setPlayerMode = function(value){
            $scope.playerMode = value;
        };

        $scope.isInteractionMode = function () {
            return $scope.interactionMode;
        }
	}
]);
