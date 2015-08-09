'use strict';
angular.module('player').controller('PlayerController', ['$scope','$stateParams','$state','$timeout','Slides','CssInjector','$interval','$location',
	function($scope, $stateParams, $state, $timeout,Slides,CssInjector,$interval,$location) {
		jQuery("#app-header").hide();
		$scope.slideName=$stateParams.slideName;
        $scope.qrConfig ={
            slideUrl: $location.$$absUrl,
            size:100,
          correctionLevel:'',
          typeNumber:0,
          inputMode:'',
          image:true
        }
        
		var slideNumber = -1;
        
		$scope.slides = [];
        if ($scope.setPlayerMode) $scope.setPlayerMode(true);
        
        $scope.lastTimeout = null;
        
        var cancelTimeOut = function(){
            if ($scope.lastTimeout) $timeout.cancel($scope.lastTimeout);
        }
        
        var loadSlide = function(slideIndex) {
            if (slideIndex<0 || slideIndex>=$scope.slides.length){
                slideIndex=0;
            }

            var slide=$scope.slides[slideIndex];
            if (!slide || !slide.content) {
                return null;
            }

            var duration = slide.durationInSeconds;
            $scope.animationType=slide.animationType;
            $scope.zoomPercent=slide.zoomPercent||100;
            slide.content.templateUrl = 'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.html';

            CssInjector.inject($scope,'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.css');
            
            $scope.qrConfig.slideUrl = slide.detailsUrl || $state.href("player",{
                slideName:$stateParams.slideName,
                slideNumber:slideNumber
            },{absolute:true}); 
            
            $state.go("player.slide",{
                slide:slide.content
            })

            return slide;
        }
        
		var loadNextSlide = function(){            
            
            cancelTimeOut();
            
            slideNumber++;
            if (slideNumber<0 || slideNumber>=$scope.slides.length){
                slideNumber=0;
            }
            var slide = loadSlide(slideNumber);
            if (!slide){
                $timeout(loadNextSlide,1);
                return;
            }

            if (slide.durationInSeconds) {
                $scope.lastTimeout = $timeout(loadNextSlide,slide.durationInSeconds*1000);
            }
		}
        
        
		var slideShow = function(){
            $scope.lastTimeout = $timeout(loadNextSlide,1);
		}
        
        
		var updateSildes = function(callback){           
            
			Slides.get({slideId:$stateParams.slideName}, function(result){
               $scope.slides = result.slides;
               if (callback) callback(result); 
			})
		}	
        $scope.updateSlidesHandle = null;
        
        
        $scope.$on("rightArrowPressed",function(){
            cancelTimeOut();
            loadNextSlide();
        });	
        $scope.$on("leftArrowPressed",function(){
            cancelTimeOut();
            slideNumber-=2;
            if (slideNumber<-1) {
                slideNumber = $scope.slides.length-2;
            }
            loadNextSlide();
        });	
        
        $scope.$on("$destroy",function(){
            $timeout.cancel($scope.lastTimeout);
            $interval.cancel($scope.updateSlidesHandle);
            if ($scope.setPlayerMode) $scope.setPlayerMode(false);
        });
        
        if ($stateParams.slideNumber){
            updateSildes(function(){
                loadSlide($stateParams.slideNumber);                
            });  
            return;
        }
        
        $scope.updateSlidesHandle = $interval(function(){updateSildes()},10*1000);
        updateSildes(slideShow);                
	}
]);