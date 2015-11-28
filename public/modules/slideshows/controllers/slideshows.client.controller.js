/*jslint nomen: true, vars: true*/
/*global angular, alert, _*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates', '$timeout', 'ServerMessageBroker', 'Tags', '$modal', 'Path', '$cacheFactory', 'resolutions',
        function ($scope, $stateParams, $location, Authentication, Slideshows, Templates, $timeout, ServerMessageBroker, Tags, $modal, Path, $cacheFactory, resolutions) {
            var serverMessageBroker = new ServerMessageBroker();

            //todo: to be extracted
            $scope.resolutions = resolutions;
            $scope.authentication = Authentication;
            $scope.currentSlide = null;
            $scope.slideshow = {
                tags: []
            };
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
                $scope.filterSlideShows();
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

                $scope.selectedResolution = -1;
                if (!slide.resolution) {
                    slide.resolution = $scope.resolutions[0];
                }

                $scope.resolutions.forEach(function (item, index) {
                    if (item.width == slide.resolution.width && item.height == item.height) {
                        $scope.selectedResolution = index;
                    }
                });

                if ($scope.selectedResolution == -1) {
                    $scope.selectedResolution = 0;
                    slide.resolution = $scope.resolutions[0];
                }
                updateTemplate();
            };

            $scope.addNewSlide = function () {
                $scope.currentSlide = {
                    templateName: $scope.selectedTemplate,
                    content: {}
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
                return Tags.query({
                    tag: text
                }, function (result) {
                    $scope.possibleTags = result.map(function (item) {
                        return item.value;
                    });
                });
            };

            $scope.saveSlideToBlueprints = function () {
                var scope = $scope.$new(true);
                scope.Slide = $scope.currentSlide;

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('saveToBlueprints', 'blueprints'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SlideBlueprintsController',
                    scope: scope
                });
            };

            $scope.addFromBlueprints = function () {
                var scope = $scope.$new(true);

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectSlideFromBlueprints', 'blueprints'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SelectSlideFromBlueprintsController',
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

            $scope.cache = $cacheFactory.get('slideshows.client.controller');
            if (angular.isUndefined($scope.cache)) {
                $scope.cache = $cacheFactory('slideshows.client.controller');
            }

            $scope.searchProvider = {
                filterEventName: 'filterSlideShows',
                cacheId: 'slideShowsFilter',
                filter: function (filterParameters) {
                    $scope.filterParameters.namesAndTagsFilterParameters = filterParameters;
                    $scope.filterSlideShows();
                },
                getPossibleFilterValues: function (search, callback) {
                    Slideshows.getFilteredNamesAndTags({
                        showOnlyMine: $scope.filterParameters.showOnlyMine,
                        namesAndTagsFilter: search
                    }, function (filterResult) {
                        callback(filterResult);
                    });
                }
            };

            $scope.filterParameters = $scope.cache.get('slideshows.client.controller.filterParameters');
            if (angular.isUndefined($scope.filterParameters)) {
                $scope.filterParameters = {
                    showOnlyMine: false,
                    namesAndTagsFilterParameters: {}
                };
            }

            $scope.onPlayOnClicked = function () {
                var scope = $scope.$new(true);

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectDevices'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SelectDevicesController',
                    scope: scope
                });
            };

            $scope.$watch('filterParameters.showOnlyMine', function (oldValue, newValue) {
                if (oldValue !== newValue) {
                    $scope.filterSlideShows();
                }
            });

            $scope.initNamesAndTagsFilter = function (select) {
                select.search = $scope.filterParameters.namesAndTagsFilter;
            };

            $scope.filterSlideShows = function () {
                Slideshows.filter({
                    showOnlyMine: $scope.filterParameters.showOnlyMine,
                    nameFilters: $scope.filterParameters.namesAndTagsFilterParameters.nameFilters,
                    tagFilters: $scope.filterParameters.namesAndTagsFilterParameters.tagFilters,
                    namesAndTagsFilter: $scope.filterParameters.namesAndTagsFilterParameters.namesAndTagsFilter
                }, function (result) {
                    $timeout(function () {
                        $scope.slideshows = result;
                        $scope.$apply();
                    });
                });
            };

            $scope.$watch("selectedResolution", function (newValue, oldValue) {
                if (!$scope.currentSlide) {
                    return;
                }
                $scope.currentSlide.resolution = $scope.resolutions[newValue];

            });

            $scope.$on("$destroy", function () {
                $scope.cache.put('slideshows.client.controller.filterParameters', $scope.filterParameters);
            });
            $scope.$on("setTemplateElement", function (event, name, value) {
                $scope.templateElements = $scope.templateElements || {};
                $scope.templateElements[name] = value;
            });
        }]);
}());
