'use strict';

// Slideshows controller
angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates','$timeout',
	function($scope, $stateParams, $location, Authentication, Slideshows, Templates,$timeout) {
		$scope.authentication = Authentication;
        $scope.currentSlide = null;
        $scope.animationTypes = ["enter-left", "enter-right", "enter-bottom", "enter-top"]
        $scope.$parent.hideHeader = false;
        
        Templates.getAll(function(response, err){
            $scope.templates = response;
        });

		// Create new Slideshow
		$scope.create = function() {
			// Create new Slideshow object
			var slideshow = new Slideshows ({
				name: this.name,
				slides: this.slides
			});

			// Redirect after save
			slideshow.$save(function(response) {
				$location.path('slideshows/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Slideshow
		$scope.remove = function(slideshow) {
			if ( slideshow ) { 
				slideshow.$remove();

				for (var i in $scope.slideshows) {
					if ($scope.slideshows [i] === slideshow) {
						$scope.slideshows.splice(i, 1);
					}
				}
			} else {
				$scope.slideshow.$remove(function() {
					$location.path('slideshows');
				});
			}
		};

		// Update existing Slideshow
		$scope.update = function() {
			var slideshow = $scope.slideshow;

			slideshow.$update(function() {
				$location.path('slideshows/' + slideshow._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Slideshows
		$scope.find = function() {
			$scope.slideshows = Slideshows.query();
		};

		// Find existing Slideshow
		$scope.findOne = function() {
			$scope.slideshow = Slideshows.get({ 
				slideshowId: $stateParams.slideshowId
			});
		};
        
        $scope.setCurrentSlide = function(slide) {
            $scope.templateElements={};
            $scope.currentSlide = slide;
            updateTemplate();
        }
        
        $scope.addNewSlide = function() {
            $scope.currentSlide =  { 
                    templateName: $scope.selectedTemplate,
                    content:{}
                };
            $scope.slideshow.slides.push($scope.currentSlide);
            updateTemplate();
        }
        
        var updateTemplate = function() {
            $scope.currentSlide.templateUrl = '';
            $timeout(function(){
                $scope.currentSlide.templateUrl = 'modules/slideshows/slideTemplates/'+($scope.currentSlide.templateName||'default')+'/slide.html';
                $scope.$apply();
            },10);
        }
        
        $scope.moveSlideUp = function(slide){
            var slideIndex = $scope.slideshow.slides.indexOf(slide);
            if (slideIndex==0) return;
            var tmp = $scope.slideshow.slides[slideIndex-1];
            $scope.slideshow.slides[slideIndex-1] = slide;
            $scope.slideshow.slides[slideIndex] = tmp;
        };
        
        $scope.moveSlideDown = function(slide){
            var slideIndex = $scope.slideshow.slides.indexOf(slide);
            if (slideIndex==$scope.slideshow.slides.length-1) return;
            var tmp = $scope.slideshow.slides[slideIndex+1];
            $scope.slideshow.slides[slideIndex+1] = slide;
            $scope.slideshow.slides[slideIndex] = tmp;
        };
        
        $scope.isCurrentSlide = function(slide){
            if (!$scope.currentSlide) return false;
            return $scope.currentSlide._id==slide._id;
        }
        
        $scope.removeCurrentSlide = function(){
            if (!$scope.currentSlide) return;
            var slideIndex = $scope.slideshow.slides.indexOf($scope.currentSlide);
            $scope.slideshow.slides.splice(slideIndex, 1);
        }
        
	}
]);