/*jslint nomen: true, vars: true*/
/*global angular, alert, _*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', 'Authentication', 'Slideshows', '$timeout', 'ServerMessageBroker', 'Tags', '$uibModal', 'Path', '$cacheFactory', 'resolutions', '$state',
        function ($scope, $stateParams, Authentication, Slideshows, $timeout, ServerMessageBroker, Tags, $uibModal, Path, $cacheFactory, resolutions, $state) {
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
            $scope.playSlideShow = false;
            $scope.viewPlayerId = 'viewPlayer';
            $scope.animationTypes = ["enter-left", "enter-right", "enter-bottom", "enter-top"];
            $scope.newSlideData = {};

            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(false);
            }

            // Remove existing Slideshow
            $scope.remove = function (slideshow) {
                $scope.slideshow.$remove(function () {
                    $state.go('listSlideshows');
                });
            };

            var goToViewSlideshow = function () {
                $state.go('viewSlideshow', { slideshowId: $scope.slideshow._id });
            };

            // Update existing Slideshow
            $scope.upsert = function () {
                var slideshow = $scope.slideshow,
                    upsertSucceeded = function (msg) {
                        $scope.okModalMessage = msg;
                        $uibModal.open({
                            animation: false,
                            templateUrl: Path.getViewUrl('okDialog', 'core'),
                            windowClass: 'iqss-core-okDialog',
                            scope: $scope
                        });
                    },
                    setScopeError = function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    };

                if (slideshow._id) {
                    slideshow.$update(upsertSucceeded('Update succeeded.'), setScopeError);
                } else {
                    $scope.slideshow.$save(upsertSucceeded('Create succeeded'), setScopeError);
                }
            };

            $scope.preview = function () {
                goToViewSlideshow();
            };

            $scope.nonSaveActionsEnabled = function () {

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
                    if ($scope.slideshow.draftSlides && $scope.slideshow.draftSlides.length > 0) {
                        $scope.setCurrentSlide($scope.slideshow.draftSlides[0]);
                    }
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
                    $scope.slideshow.nrOfDevicesTheSlideIsAttachedTo = devices.filter(function (device) {
                        return device.checked;
                    }).length;
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
                if ($scope.currentSlide) {
                    $scope.currentSlide.fireSetTemplateElementEvent = false;
                }

                $scope.templateElements = {};
                $scope.currentSlide = slide;
                $scope.selectedResolution = -1;

                if (!slide) {
                    return;
                }

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
                $scope.currentSlide.fireSetTemplateElementEvent = true;
                updateTemplate();
            };

            function getDraftSlideIndex(slideId) {
                return _.findIndex($scope.slideshow.draftSlides, function (aSlide) {
                    return aSlide._id === slideId;
                });
            }

            $scope.slideDropped = function (targetSlideId, draggedSlideId) {
                var targetSlideIndex = getDraftSlideIndex(targetSlideId);
                if (targetSlideIndex === -1) {
                    return;
                }

                var draggedSlideIndex = getDraftSlideIndex(draggedSlideId);
                if (draggedSlideIndex === -1) {
                    return;
                }

                var indexAdjuster = (draggedSlideIndex > targetSlideIndex) ? 1 : 0;
                var draftSlides = $scope.slideshow.draftSlides;
                var draggedSlide = draftSlides.splice(draggedSlideIndex, 1)[0];
                draftSlides.splice(targetSlideIndex + indexAdjuster, 0, draggedSlide);
                $scope.$apply();
            };

            $scope.isCurrentSlide = function (slide) {
                if (!$scope.currentSlide) {
                    return false;
                }
                return $scope.currentSlide === slide;
            };

            $scope.removeSlide = function (slide) {
                var slideIndex = $scope.slideshow.draftSlides.indexOf(slide),
                    newCurrentSlide = null,
                    wasCurrentSlide = $scope.currentSlide === slide;
                $scope.slideshow.draftSlides.splice(slideIndex, 1);
                if (!wasCurrentSlide) {
                    return;
                }
                if ($scope.slideshow.draftSlides.length > 0) {
                    newCurrentSlide = $scope.slideshow.draftSlides[0];
                }
                $scope.setCurrentSlide(newCurrentSlide);
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

            $scope.saveSlideToBlueprints = function (slide) {
                var scope = $scope.$new(true);
                scope.Slide = slide;

                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('saveToBluePrints', 'blueprints'),
                    windowClass: 'iqss-slideshowedit-saveSlideToBlueprints-container',
                    controller: 'SlideBlueprintsController',
                    scope: scope
                });
            };

            $scope.addNewSlide = function () {
                var scope = $scope.$new(true),
                    newSlide;

                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('addNewSlide'),
                    windowClass: 'iqss-slideshowedit-addNewSlide',
                    controller: 'AddNewSlideController',
                    scope: scope
                }).result.then(function (newSlideData) {
                    if (!newSlideData) {
                        return;
                    }

                    if (newSlideData.templateName) {
                        newSlide = {
                            templateName: newSlideData.templateName,
                            content: {}
                        };
                        $scope.slideshow.draftSlides = $scope.slideshow.draftSlides || [];
                        $scope.slideshow.draftSlides.push(newSlide);
                    }
                    if (newSlideData.slide) {
                        delete newSlideData.slide._id;
                        delete newSlideData.slide._v;
                        newSlide = angular.merge({}, newSlideData.slide);
                        $scope.slideshow.draftSlides.push(newSlide);
                    }
                    $scope.setCurrentSlide(newSlide);
                });
            };

            $scope.onPlayOnClicked = function () {
                var scope = $scope.$new(true);

                scope.onPlayedOnDevicesSaved = function () {
                    $scope.getNrOfDevicesTheSlideIsAttachedTo();
                };

                $uibModal.open({
                    animation: false,
                    templateUrl: Path.getViewUrl('selectDevices'),
                    windowClass: 'iqss-slideshowview-playing-on',
                    backdrop: 'static',
                    controller: 'SelectDevicesController',
                    scope: scope
                });
            };

            $scope.togglePlay = function () {
                $scope.playSlideShow = !$scope.playSlideShow;
                var messageToBroadcast = $scope.playSlideShow ? 'resetOnHold' : 'putPlayerOnHold';
                $scope.$broadcast(messageToBroadcast, $scope.viewPlayerId);
            };

            $scope.$watch("selectedResolution", function (newValue, oldValue) {
                if (!$scope.currentSlide) {
                    return;
                }
                $scope.currentSlide.resolution = $scope.resolutions[newValue];

            });

            $scope.$on("$destroy", function () {
                if ($scope.cache) {
                    $scope.cache.put('slideshows.client.controller.filterParameters', $scope.filterParameters);
                }
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
            if ($stateParams.slideshowId !== 'new') {
                $scope.findById();
            } else {
                $scope.slideshow = new Slideshows({
                    name: '',
                    slides: []
                });
            }
        }]);
}());
