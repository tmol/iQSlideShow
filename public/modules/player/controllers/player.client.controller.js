'use strict';
angular.module('player').controller('PlayerController', ['$scope','$stateParams','$state','$timeout','Slides','CssInjector',
	function($scope, $stateParams, $state, $timeout,Slides,CssInjector) {
		jQuery("#app-header").hide();
		$scope.slideName=$stateParams.slideName;
		var slideNumber = -1;
		$scope.slides = [];
        $scope.$parent.playerMode = true;
        $scope.lastTimeout = null;
		var loadNextSlide = function(){            
            
            if ($scope.lastTimeout) $timeout.cancel($scope.lastTimeout);
            
            slideNumber++;
            if (slideNumber==$scope.slides.length){
                slideNumber=0;
            }

            var slide=$scope.slides[slideNumber];
            if (!slide || !slide.content) {
                $timeout(loadNextSlide,1);
                return;
            }

            var duration = slide.durationInSeconds;
            $scope.animationType=slide.animationType;
            slide.content.templateUrl = 'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.html';

            CssInjector.inject($scope,'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.css');

            $state.go("player.slide",{
                slide:slide.content
            })

            if (duration) {
                $scope.lastTimeout = $timeout(loadNextSlide,duration*1000);
            }
		}
        
		var slideShow = function(s){
            $scope.slides = s;
            $scope.lastTimeout = $timeout(loadNextSlide,1);
		}
        
		var loadSildes = function(){
			Slides.get({slideId:$stateParams.slideName}, function(result){
                slideShow(result.slides);
			})
		}	
        
		loadSildes();
        
        $scope.$on("onApplicationclick",loadNextSlide);	
        $scope.$on("$destroy",function(){
            $timeout.cancel($scope.lastTimeout);
        });
	}
]);