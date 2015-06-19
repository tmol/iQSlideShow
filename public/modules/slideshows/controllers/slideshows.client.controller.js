'use strict';

// Slideshows controller
angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates','$timeout',
	function($scope, $stateParams, $location, Authentication, Slideshows, Templates,$timeout) {
		$scope.authentication = Authentication;
        $scope.currentSlide = null;
        
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
            $scope.currentSlide.templateUrl = '';
            $timeout(function(){
                $scope.currentSlide.templateUrl = 'modules/slideshows/slideTemplates/'+(slide.template||'default')+'/slide.html';
                $scope.$apply();
            },1);
        }
        
        $scope.addNewSlide = function() {
            $scope.slideshow.slides.push({ templateName: $scope.selectedTemplate });
        }
	}
]);