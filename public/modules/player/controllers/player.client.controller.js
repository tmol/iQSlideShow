'use strict';
angular.module('player').controller('PlayerController', ['$scope', '$stateParams', '$state', '$timeout', 'Slides', 'CssInjector', '$interval', '$location', 'PubNub',
	function ($scope, $stateParams, $state, $timeout, Slides, CssInjector, $interval, $location, PubNub) {
		if ($scope.initialised) {
            return;
        }
        $scope.initialised = true;
        $scope.deviceId = $stateParams.deviceId || PUBNUB.unique();

        PubNub.init({
          publish_key : 'pub-c-906ea9e7-a221-48ed-a2d8-5475a6214f45',
          subscribe_key : 'sub-c-dd5eeffe-481e-11e5-b63d-02ee2ddab7fe',
          uuid : $scope.deviceId
        });

        jQuery("#app-header").hide();
		$scope.slideName = $stateParams.slideName;
        $scope.qrConfig = {
            slideUrl: $location.$$absUrl,
            size: 100,
            correctionLevel: '',
            typeNumber: 0,
            inputMode: '',
            image: true
        };
        
		var slideNumber = -1;
        
		$scope.slides = [];
        if ($scope.setPlayerMode) {
            $scope.setPlayerMode(true);
        }
        
        $scope.lastTimeout = null;
        
        var cancelTimeOut = function () {
            if ($scope.lastTimeout) {
                $timeout.cancel($scope.lastTimeout);
            }
        };
        
        var loadSlide = function (slideIndex) {
            if (slideIndex < 0 || slideIndex >= $scope.slides.length) {
                slideIndex = 0;
            }

            var slide = $scope.slides[slideIndex];
            if (!slide) {
                return null;
            }

            $scope.qrConfig.slideUrl = $state.href("deviceInteraction",{
                deviceId : $scope.deviceId,
                slideshowId : $stateParams.slideName,
                slideNumber : slideNumber
            },{absolute:true});

            if (!slide.content) {
                return null;
            }

            var duration = slide.durationInSeconds;
            $scope.animationType=slide.animationType;
            $scope.zoomPercent=slide.zoomPercent||100;
            slide.content.templateUrl = 'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.html';

            CssInjector.inject($scope,'modules/slideshows/slideTemplates/'+(slide.templateName||'default')+'/slide.css');
            

            
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
                $scope.lastTimeout = $timeout(loadNextSlide,1000);
                return;
            }
            console.log($scope.$id);

            if (slide.durationInSeconds) {
                $scope.lastTimeout = $timeout(loadNextSlide,slide.durationInSeconds*1000);
            }
		}
        
        
		var slideShow = function(){
            $scope.lastTimeout = $timeout(loadNextSlide,1);
		}
        
        var theChannel = 'iQSlideShow';

        PubNub.ngSubscribe({ channel: theChannel });


        $scope.delayedRequest = null;

        $scope.$on(PubNub.ngMsgEv(theChannel), function(event, payload) {
            var pub = PubNub;
            // payload contains message, channel, env...
            if (payload.message.action === "setSlideShow" && payload.message.id === $scope.deviceId) {
                //If the state is changed to quick, errors can occur.
                $timeout.cancel($scope.delayedRequest);
                $scope.delayedRequest = $timeout(function() {
                    $timeout.cancel($scope.lastTimeout);
                    $interval.cancel($scope.updateSlidesHandle);
                    $scope.slides = [];
                    $state.go("player",{ slideName : payload.message.slideShowId , deviceId : $scope.deviceId},{reload : true});
                    console.log('change slide to :', payload.message.slideShowId);
                },1000);
            }
        })

        $scope.$on(PubNub.ngPrsEv(theChannel), function(event, payload) {
            // payload contains message, channel, env...
            console.log('got a presence event:', payload);
        })
        
		var updateSildes = function(callback){           
            
			Slides.get({slideId:$stateParams.slideName}, function(result){
               $scope.slides = result.slides;
               if (callback) callback(result); 
			})

            PubNub.ngPublish({
                channel: theChannel,
                message: {
                            action : 'presence',
                            id : $scope.deviceId,
                            slideShowId : $scope.slideName
                         }
            });

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
