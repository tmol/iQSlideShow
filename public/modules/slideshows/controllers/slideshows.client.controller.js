/*jslint nomen: true, vars: true*/
/*global angular, alert, _*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Slideshows', 'Templates', '$timeout', 'ServerMessageBroker', 'Tags', '$modal', 'Path', '$cacheFactory', 'resolutions', 'DateFormatter',
        function ($scope, $stateParams, $location, Authentication, Slideshows, Templates, $timeout, ServerMessageBroker, Tags, $modal, Path, $cacheFactory, resolutions, DateFormatter) {
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
            $scope.dateFormatter = DateFormatter;
            $scope.playSlideShow = false;
            $scope.viewPlayerId = 'viewPlayer';
            $scope.animationTypes = ["enter-left", "enter-right", "enter-bottom", "enter-top"];

            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(false);
            }

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
                $scope.slideshow.$remove(function () {
                    $location.path('slideshows');
                });
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
                serverMessageBroker
                    .publishSlideShow($scope.slideshow._id)
                    .then(function () {
                        alert("Published");
                    });
            };

            $scope.findById = function () {
                Slideshows.get({
                    slideshowId: $stateParams.slideshowId
                }, function (slideshow) {
                    $scope.slideshow  = slideshow;
                    $scope.getNrOfDevicesTheSlideIsAttachedTo();
                });
            };

            $scope.getNrOfDevicesTheSlideIsAttachedTo  = function () {
                 if (!$scope.slideshow) {
                    return;
                }

                Slideshows.getDevices({
                    slideshowId: $scope.slideshow._id
                }, function (devices) {
                    $scope.slideshow.nrOfDevicesTheSlideIsAttachedTo = devices.filter(function(device) {
                        return device.checked;
                    }).length;
                });
            }

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

            $scope.onPlayOnClicked = function () {
                var scope = $scope.$new(true);

                scope.onPlayedOnDevicesSaved = function () {
                    $scope.getNrOfDevicesTheSlideIsAttachedTo();
                };

                $modal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectDevices'),
                    windowClass: 'waitingForActivationDialog',
                    backdrop: 'static',
                    controller: 'SelectDevicesController',
                    scope: scope
                });
            };

            $scope.togglePlay = function() {
                $scope.playSlideShow = !$scope.playSlideShow;
                var messageToBroadcast = $scope.playSlideShow ?
                    'resetOnHold' : 'putPlayerOnHold';
                $scope.$broadcast(messageToBroadcast, $scope.viewPlayerId);
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
