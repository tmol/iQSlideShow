'use strict';
angular.module('player').controller('PlayerController', ['$scope','$stateParams','$state','$timeout','Slides','CssInjector',
	function($scope, $stateParams, $state, $timeout,Slides,CssInjector) {
		
		$scope.slideName=$stateParams.slideName;
		var slideNumber = -1;
		
		
		var slideShow = function(slides){
			var loadNextSlide = function(){
				slideNumber++;
				if (slideNumber==slides.length){
					slideNumber=0;
				}
                
				var slide=slides[slideNumber];
                if (!slide || !slide.content) {
                    $timeout(loadNextSlide,1);
                    return;
                }
				$scope.animationType=slide.animationType;
				slide.content.templateUrl = 'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.html';
				
				CssInjector.inject($scope,'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.css');
				
				$state.go("player.slide",{
					slide:slide.content
				})
				
				//load the next slide after the configured delay.
				$timeout(loadNextSlide,slides[slideNumber].durationInSeconds*1000)
			}
		
			$timeout(loadNextSlide,1);
		}
		var loadSildes =function(){
			Slides.get({slideId:$stateParams.slideName}, function(result){
				slideShow(result.slides);
			})
		}	
		loadSildes();
		
	}
]);