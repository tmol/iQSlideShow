/*jslint nomen: true, vars: true*/
/*global angular, alert, _, confirm*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsController', ['$scope', '$stateParams', 'Authentication', 'Slideshows', '$timeout', 'ServerMessageBroker', 'Tags', '$uibModal', 'Path', '$cacheFactory', '$state', 'ActionResultDialogService', 'Admin', 'DragAndDropItemsArray', 'animationTypes',
        function ($scope, $stateParams, Authentication, Slideshows, $timeout, ServerMessageBroker, Tags, $uibModal, Path, $cacheFactory, $state, ActionResultDialogService, Admin, DragAndDropItemsArray, animationTypes) {
            var serverMessageBroker = new ServerMessageBroker();

            var defResolution = {height: 1080, width: 1920},
                dragAndDropItemsArray,
                lastIndexMovedDuringDragAndDrop;

            $scope.authentication = Authentication;
            $scope.currentSlide = null;
            $scope.playerView = Path.getViewUrl('player.client.view', 'preview');
            $scope.previewSlideshowId = $stateParams.slideshowId;
            $scope.currentPreviewSlideIndex = 0;
            $scope.numberOfSlides = 0;
            $scope.view = {};
            $scope.slideshow = {
                tags: []
            };
            $scope.possibleTags = [];
            $scope.playSlideShow = false;
            $scope.viewPlayerId = 'viewPlayer';
            $scope.animationTypes = animationTypes;
            $scope.newSlideData = {};
            $scope.adminConfig = Admin.getConfig();
            $scope.displayPreview = true;

            if ($scope.setPlayerMode) {
                $scope.setPlayerMode(false);
            }

            // Remove existing Slideshow
            $scope.remove = function (slideshow) {
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    return;
                }
                ActionResultDialogService.showOkCancelDialog('Are you sure do you want to remove the slideshow?', $scope, function () {
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                    $scope.slideshow.$remove(function () {
                        $scope.slideshow = null;
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                        ActionResultDialogService.showOkDialog('Remove succeeded', $scope, function () {
                            $state.go('listSlideshows');
                        });
                    }, function (err) {
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                        ActionResultDialogService.showErrorDialog('Remove unsuccessful.', err.data.message, $scope);
                    });
                });
            };

            var goToViewSlideshow = function () {
                $state.go('viewSlideshow', { slideshowId: $scope.slideshow._id });
            };

            var showOkDialog = function (msg, callback) {
                ActionResultDialogService.showOkDialog(msg, $scope, callback);
            };

            var checkMandatoryFields = function () {
                var errMsg = '',
                    animationTypesRequiredMsg,
                    idx = 0;

                if (!$scope.slideshow.name) {
                    errMsg = 'The slideshow title is not specified.';
                }
                _.forEach($scope.slideshow.draftSlides, function (slideshow) {
                    idx = idx + 1;
                    if (!slideshow.animationType) {
                        if (animationTypesRequiredMsg) {
                            animationTypesRequiredMsg = animationTypesRequiredMsg + ', ';
                        }
                        animationTypesRequiredMsg = (animationTypesRequiredMsg || '') + (slideshow.title || '') + ' (position ' + idx + ')';
                    }
                });
                if (animationTypesRequiredMsg) {
                    animationTypesRequiredMsg = 'The animation type is not specified for the following slides: ' + animationTypesRequiredMsg + '.';
                }
                if (animationTypesRequiredMsg) {
                    if (errMsg.length > 0) {
                        errMsg = errMsg + '\r\n';
                    }
                    errMsg = errMsg + animationTypesRequiredMsg;
                }
                return errMsg;
            };

            var handleErrorOnUpsert = function (errorResponse) {
                $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                ActionResultDialogService.showWarningDialog(errorResponse.data.message, $scope);
            };

            function initSlideShowJson() {
                $scope.slideshowJson = JSON.stringify($scope.slideshow);
            }

            $scope.isNewSlideShow = function () {
                return !$scope.slideshow._id;
            }

            $scope.save = function (callback) {
                var currentSlideIndex;
                var error = checkMandatoryFields();

                if (error) {
                    $scope.error = error;
                    return;
                }

                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    return;
                }

                if ($scope.currentSlide) {
                    currentSlideIndex = $scope.slideshow.draftSlides.indexOf($scope.currentSlide);
                }

                $scope.waitingForServerSideProcessingAndThenForResultDialog = true;

                function internalSuccessHandler () {
                    $scope.error = '';
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                    initSlideShowJson();

                    // I don't know why the binding is lost, but this solves it
                    if (currentSlideIndex >= 0) {
                        $scope.setCurrentSlide($scope.slideshow.draftSlides[currentSlideIndex]);
                    }
                }

                if ($scope.isNewSlideShow()) {
                    $scope.slideshow.$save(function (slideshow) {
                        internalSuccessHandler();

                        if (callback) {
                            callback();
                        } else {
                            showOkDialog('Create succeeded.', function () {
                                $state.go('editSlideshow', { slideshowId: slideshow._id });
                            });
                        }
                    }, handleErrorOnUpsert);
                } else {
                    $scope.slideshow.$update(function () {
                        internalSuccessHandler();

                        if (callback) {
                            callback();
                        } else {
                            showOkDialog('Update succeeded.');
                        }
                    }, handleErrorOnUpsert);
                }
            };

            $scope.preview = function () {
                goToViewSlideshow();
            };

            $scope.nonSaveActionsEnabled = function () {

            };

            function slideShowChanged() {
                if (!$scope.slideshow) {
                    return false;
                }
                var clone = _.cloneDeep($scope.slideshow),
                    idx;
                delete clone.nrOfDevicesTheSlideIsAttachedTo;
                _.forEach(clone.draftSlides, function (draftSlide) {
                    delete draftSlide.$$hashKey;
                    delete draftSlide.fireSetTemplateElementEvent;
                    delete draftSlide.templateUrl;
                    delete draftSlide.dragAndDropId;
                    delete draftSlide.pageNr;
                    delete draftSlide.numPages;
                    delete draftSlide.isEdit;
                });

                return JSON.stringify(clone) !== $scope.slideshowJson;
            }

            $scope.publish = function () {
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    return;
                }
                var publish = function () {
                    serverMessageBroker
                        .publishSlideShow($scope.slideshow._id)
                        .then(function () {
                            $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                            showOkDialog('Publish succeeded.', function () {
                                $state.go('editSlideshow', { slideshowId: $scope.slideshow._id });
                            });
                        });
                };
                if ($scope.isNewSlideShow()) {
                    ActionResultDialogService.showOkCancelDialog('The slideshow will be automatically saved before publishing. Do you agree?', $scope, function () {
                        $scope.save(function () {
                            $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                            publish();
                        });
                    });
                } else if (slideShowChanged()) {
                    ActionResultDialogService.showOkCancelDialog('The slideshow changed and will be automatically saved before publishing. Do you agree?', $scope, function () {
                        $scope.save(function () {
                            $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                            publish();
                        });
                    });
                } else {
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                    publish();
                }
            };

            $scope.findById = function () {
                Slideshows.get({
                    slideshowId: $stateParams.slideshowId
                }, function (slideshow) {
                    $scope.slideshow  = slideshow;
                    initSlideShowJson();
                    if ($scope.slideshow.draftSlides.length > 0) {
                        $scope.setCurrentSlide($scope.slideshow.draftSlides[0]);
                        _.forEach($scope.slideshow.draftSlides, function (item) {
                            item.dragAndDropId = item._id;
                        });
                    } else {
                        $scope.displayPreview = false;
                    }
                    dragAndDropItemsArray = new DragAndDropItemsArray($scope.getDraggableItemsArray());
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
                $scope.currentSlide.templateUrl = 'modules/slideshows/slideTemplates/' + ($scope.currentSlide.templateName || 'default') + '/slide.html';
                $scope.displayPreview = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                $timeout(function () {
                    $scope.displayPreview = true;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }, 1);
            };

            $scope.setCurrentSlide = function (slide) {
                if ($scope.currentSlide) {
                    $scope.currentSlide.fireSetTemplateElementEvent = false;
                }

                $scope.templateElements = {};
                $scope.currentSlide = slide;
                $scope.view.selectedResolution = -1;

                _.each($scope.slideshow.draftSlides, function (slide) {
                    slide.isEdit = false;
                });

                if (!slide) {
                    return;
                }

                slide.isEdit = true;
                slide.resolution = defResolution; //todo: remove this later
                $scope.currentSlide.fireSetTemplateElementEvent = true;
                updateTemplate();
            };

            $scope.slidesHeightSetterStrategy = {
                getSlides: function () {
                    return $scope.slideshow.draftSlides;
                },
                reselectCurrentSlideToFixChormeHeightCalculationBug: function () {
                    var currentSlide = $scope.currentSlide;
                    $scope.setCurrentSlide(null);
                    $timeout(function () {
                        $scope.setCurrentSlide(currentSlide);
                    }, 200);
                }
            };

            $scope.getDraggableItemsArray = function () {
                return {
                    items: $scope.slideshow.draftSlides,
                    dragAndDropItemsArray: dragAndDropItemsArray,
                    lastIndexMovedDuringDragAndDrop: lastIndexMovedDuringDragAndDrop,
                    itemsChanged: function () {
                        $timeout(function () {
                            $scope.$apply();
                        });
                    },
                    itemDropped: function (slide) {
                        $scope.currentSlide = slide;
                        $timeout(function () {
                            $scope.$apply();
                        });
                    }
                };
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
                        $scope.slideshow.draftSlides.push(newSlide);
                        newSlide.dragAndDropId = 'Id' + Math.random();
                        newSlide.durationInSeconds = $scope.adminConfig.defaultSlideDuration;
                        newSlide.animationType = $scope.adminConfig.defaultAnimationType;
                    }
                    if (newSlideData.slide) {
                        var dragAndDropId = newSlideData.slide._id;
                        delete newSlideData.slide._id;
                        delete newSlideData.slide._v;
                        newSlide = angular.merge({}, newSlideData.slide);
                        newSlide.dragAndDropId = dragAndDropId;
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

            $scope.atLeastOneSlideAdded = function () {
                return $scope.slideshow && $scope.slideshow.draftSlides && $scope.slideshow.draftSlides.length > 0;
            };

            $scope.$on("$destroy", function () {
                if ($scope.cache) {
                    $scope.cache.put('slideshows.client.controller.filterParameters', $scope.filterParameters);
                }
                $scope.$emit("slideContextUnloaded");
            });

            $scope.$on("setTemplateElement", function (event, name, info) {
                var slidePartId = event.targetScope.$id;

                $scope.templateElements = $scope.templateElements || {};
                $scope.templateElements[name] = info;

                if ($scope.currentSlide) {
                    $scope.currentSlide.content = $scope.currentSlide.content || {};

                    if (!$scope.currentSlide.content.hasOwnProperty(name)) {
                        $scope.currentSlide.content[name] = info.value;
                    }
                }
            });

            $scope.$on('$stateChangeStart', function (event) {
                if (slideShowChanged()) {
                    var msg = "The slideshow was changed. Are you sure you want to leave this page?";
                    if ($scope.isNewSlideShow()) {
                        msg = "The new slideshow was not saved. Are you sure you want to leave this page?";
                    }
                    var answer = confirm(msg);

                    if (!answer) {
                        event.preventDefault();
                    }
                }
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    event.preventDefault();
                }
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
                    slides: [],
                    draftSlides: []
                });
                $scope.displayPreview = false;
                initSlideShowJson();
            }
        }]);
}());
