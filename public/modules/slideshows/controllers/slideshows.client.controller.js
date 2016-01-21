/*jslint nomen: true, vars: true*/
/*global angular, alert, _*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates', '$timeout', 'ServerMessageBroker', 'Tags', '$modal', 'Path', '$cacheFactory', 'resolutions',
        function ($scope, $stateParams, $location, Authentication, Slideshows, Templates, $timeout, ServerMessageBroker, Tags, $modal, Path, $cacheFactory, resolutions) {
            var serverMessageBroker = new ServerMessageBroker();

            $scope.resolutions = resolutions;
            $scope.authentication = Authentication;
            $scope.currentSlide = null;
            $scope.playerView = Path.getViewUrl('player.client.view', 'preview');
            $scope.previewSlideshowId = $stateParams.slideshowId;
            $scope.currentPreviewSlideIndex = 0;
            $scope.numberOfSlides = 0;
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

            $scope.formatDate = function (dateString) {
                var date = new Date(dateString);
                var day = date.getDate();
                if (day < 10) {
                    day = '0' + day;
                }
                var month = date.getMonth() + 1;
                if (month < 10) {
                    month = '0' + month;
                }
                return day + '.' + month + '.' + date.getFullYear();
            };

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

            // todo what happens when error occures?
            $scope.publishById = function (id) {
                serverMessageBroker
                    .publishSlideShow(id)
                    .then(function () {
                        alert("Published");
                    });
            };

            $scope.publish = function () {
                $scope.publishById($scope.slideshow._id);
            };

            $scope.findById = function () {
                $scope.slideshow = Slideshows.get({
                    slideshowId: $stateParams.slideshowId
                });
            };

            $scope.getCurrentSlideShowStatus = function () {
                if ($scope.slideshow.published) {
                    return 'Published';
                }

                return 'Draft';
            };

            var updateTemplate = function () {
                var newTemplateUrl = 'modules/slideshows/slideTemplates/' + ($scope.currentSlide.templateName || 'default') + '/slide.html';
                if (newTemplateUrl === $scope.currentSlide.templateUrl
                        || !$scope.currentSlide.templateUrl) {
                    $scope.currentSlide.templateUrl = '';
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }

                $timeout(function () {
                    $scope.currentSlide.templateUrl = 'modules/slideshows/slideTemplates/' + ($scope.currentSlide.templateName || 'default') + '/slide.html';
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
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
                    if (item.width === slide.resolution.width && item.height === slide.resolution.height) {
                        $scope.selectedResolution = index;
                    }
                });

                if ($scope.selectedResolution === -1) {
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

            $scope.removeSlide = function (slide) {
                var slideIndex = $scope.slideshow.draftSlides.indexOf(slide);
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

            $scope.navigateToCreateNewSlideShow = function () {
                $location.path('/slideshows/create');
            }

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
                    pageSize: 12,
                    fullyLoaded: false,
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

            function executeFilter(callback) {
                Slideshows.filter({
                    showOnlyMine: $scope.filterParameters.showOnlyMine,
                    pageSize: $scope.filterParameters.pageSize,
                    lastPageLastItemCreated: $scope.filterParameters.lastPageLastItemCreated,
                    nameFilters: $scope.filterParameters.namesAndTagsFilterParameters.nameFilters,
                    tagFilters: $scope.filterParameters.namesAndTagsFilterParameters.tagFilters,
                    namesAndTagsFilter: $scope.filterParameters.namesAndTagsFilterParameters.namesAndTagsFilter
                }, function (result) {
                    if (result.length > 0) {
                        $scope.filterParameters.lastPageLastItemCreated = _.last(result).created;
                    }
                    if (result.length < $scope.filterParameters.pageSize) {
                        $scope.filterParameters.fullyLoaded = true;
                    }
                    $timeout(function () {
                        callback(result);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }

            $scope.filterSlideShows = function (scrolling) {
                delete $scope.filterParameters.lastPageLastItemCreated;
                delete $scope.filterParameters.fullyLoaded;
                executeFilter(function(results) {
                    results.splice(0, 0, { isPlacheloderForCreateNew: true});
                    $scope.slideshows = results;
                });
            };

            $scope.getNextChunk = function() {
                if ($scope.filterParameters.fullyLoaded) {
                    return;
                }
                executeFilter(function(results) {
                    var concatenatedSlideshows = _($scope.slideshows).concat(results).value();
                    $scope.slideshows = concatenatedSlideshows;
                });
            }

            $scope.$watch("selectedResolution", function (newValue, oldValue) {
                if (!$scope.currentSlide) {
                    return;
                }
                $scope.currentSlide.resolution = $scope.resolutions[newValue];

            });

            $scope.$on("$destroy", function () {
                $scope.cache.put('slideshows.client.controller.filterParameters', $scope.filterParameters);
                $scope.$emit("slideContextUnloaded");
            });
            $scope.$on("setTemplateElement", function (event, name, value) {
                $scope.templateElements = $scope.templateElements || {};
                $scope.templateElements[name] = value;
            });
            $scope.moveSlideLeft = function () {
                $scope.$broadcast("moveSlideLeft");
            };
            $scope.moveSlideRight = function () {
                $scope.$broadcast("moveSlideRight");
            };
            $scope.$on("slidesLoaded", function (event, slides) {
                $scope.numberOfSlides = slides.length;
            });
            $scope.$on("currentSlideChanged", function (event, slideIndex) {
                $scope.currentPreviewSlideIndex = slideIndex + 1;
            });
        }]);
}());
