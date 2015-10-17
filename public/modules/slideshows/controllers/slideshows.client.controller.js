/*jslint nomen: true, vars: true*/
/*global angular, alert*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates', '$timeout', 'ServerMessageBroker', 'Tags', '$modal', 'Path',
        function ($scope, $stateParams, $location, Authentication, Slideshows, Templates, $timeout, ServerMessageBroker, Tags, $modal, Path) {
            var serverMessageBroker = new ServerMessageBroker();
            $scope.authentication = Authentication;
            $scope.currentSlide = null;
            $scope.slideshow = {
                tags: []
            };
            $scope.possibleTags = [];
            $scope.animationTypes = ["enter-left", "enter-right", "enter-bottom", "enter-top"];
            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(false);
            }

            Templates.getAll(function (response) {
                $scope.templates = response;
            });

            // Create new Slideshow
            $scope.create = function () {
                // Create new Slideshow object
                var slideshow = new Slideshows({
                    name: this.name,
                    slides: this.slides
                });

                // Redirect after save
                slideshow.$save(function (response) {
                    $location.path('slideshows/' + response._id);

                    // Clear form fields
                    $scope.name = '';
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Remove existing Slideshow
            $scope.remove = function (slideshow) {
                if (slideshow) {
                    slideshow.$remove();
                    var i;
                    for (i in $scope.slideshows) {
                        if ($scope.slideshows[i] === slideshow) {
                            $scope.slideshows.splice(i, 1);
                        }
                    }
                } else {
                    $scope.slideshow.$remove(function () {
                        $location.path('slideshows');
                    });
                }
            };

            // Update existing Slideshow
            $scope.update = function () {
                var slideshow = $scope.slideshow;

                slideshow.$update(function () {
                    $location.path('slideshows/' + slideshow._id);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            $scope.publish = function () {
                serverMessageBroker
                    .publishSlideShow($scope.slideshow._id)
                    .then(function () {
                        alert("Published");
                    });
            };
            // Find a list of Slideshows
            $scope.find = function () {
                $scope.slideshows = Slideshows.query();
            };

            // Find existing Slideshow
            $scope.findOne = function () {
                $scope.slideshow = Slideshows.get({
                    slideshowId: $stateParams.slideshowId
                });
            };

            var updateTemplate = function () {
                $scope.currentSlide.templateUrl = '';
                $timeout(function () {
                    $scope.currentSlide.templateUrl = 'modules/slideshows/slideTemplates/' + ($scope.currentSlide.templateName || 'default') + '/slide.html';
                    $scope.$apply();
                }, 10);
            };

            $scope.setCurrentSlide = function (slide) {
                $scope.templateElements = {};
                $scope.currentSlide = slide;
                updateTemplate();
            };

            $scope.addNewSlide = function () {
                $scope.currentSlide =  {
                    templateName: $scope.selectedTemplate,
                    content : {}
                };
                $scope.slideshow.draftSlides.push($scope.currentSlide);
                updateTemplate();
            };



            $scope.moveSlideUp = function (slide) {
                var slideIndex, tmp;

                slideIndex = $scope.slideshow.draftSlides.indexOf(slide);
                if (slideIndex === 0) {
                    return;
                }

                tmp = $scope.slideshow.draftSlides[slideIndex - 1];
                $scope.slideshow.draftSlides[slideIndex - 1] = slide;
                $scope.slideshow.draftSlides[slideIndex] = tmp;
            };

            $scope.moveSlideDown = function (slide) {
                var slideIndex, tmp;

                slideIndex = $scope.slideshow.draftSlides.indexOf(slide);
                if (slideIndex === $scope.slideshow.slides.length - 1) {
                    return;
                }

                tmp = $scope.slideshow.draftSlides[slideIndex + 1];
                $scope.slideshow.draftSlides[slideIndex + 1] = slide;
                $scope.slideshow.draftSlides[slideIndex] = tmp;
            };

            $scope.isCurrentSlide = function (slide) {
                if (!$scope.currentSlide) {
                    return false;
                }
                return $scope.currentSlide === slide;
            };

            $scope.removeCurrentSlide = function () {
                if (!$scope.currentSlide) {
                    return;
                }
                var slideIndex = $scope.slideshow.draftSlides.indexOf($scope.currentSlide);
                $scope.slideshow.draftSlides.splice(slideIndex, 1);
            };

            $scope.removeTag = function (index) {
                $scope.slideshow.tags.splice(index, 1);
            };
            $scope.addTag = function () {
                if ($scope.desiredTag) {
                    $scope.slideshow.tags = $scope.slideshow.tags || [];
                    if ($scope.slideshow.tags.indexOf($scope.desiredTag) > -1) {
                        $scope.desiredTag = "";
                        return;
                    }
                    $scope.slideshow.tags.push($scope.desiredTag);
                    $scope.desiredTag = "";
                }
            };
            $scope.refreshTags = function (text) {
                return Tags.query({tag: text}, function (result) {
                    $scope.possibleTags = result.map(function (item) {return item.value; });
                });
            };

            $scope.saveSlideToRepository = function () {
                var scope = $scope.$new(true);
                scope.Slide = $scope.currentSlide;

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('saveToRepository'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SlidesRepositoryController',
                    scope: scope
                });
            };

            $scope.addFromRepo = function () {
                var scope = $scope.$new(true);

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectSlideFromRepository'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SelectSlideFromRepositoryController',
                    scope: scope
                }).result.then(function (slide) {
                    if (!slide) {
                        return;
                    }
                    delete slide._id;
                    delete slide._v;
                    $scope.currentSlide = angular.merge({}, slide);
                    $scope.slideshow.draftSlides.push($scope.currentSlide);
                    updateTemplate();
                });
            };
        }]);
}());
