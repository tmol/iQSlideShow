'use strict'
angular.module('player').controller('SlideController',['$scope','$stateParams','$timeout',
    function($scope,$stateParams,$timeout){
        if (!$stateParams.slide) return;
        $scope.slide=$stateParams.slide;
    }
])