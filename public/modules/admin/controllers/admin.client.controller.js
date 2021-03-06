/*global angular, _*/

(function () {
    'use strict';

    angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'Slideshows', 'ActionResultDialogService', 'animationTypes',
        function ($scope, $stateParams, $location, Authentication, Admin, Slideshows, ActionResultDialogService, animationTypes) {
            $scope.authentication = Authentication;
            $scope.animationTypes = animationTypes;

            $scope.isConfigValid = function () {
                return $scope.userSelectedSlideShowsPlayTimeInMinutesValid()
                    && $scope.nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathyValid()
                    && $scope.sizeOfAutocompleteListForTagsValid()
                    && $scope.defaultSlideDurationValid()
                    && $scope.defaultSlideShowSelected();
            };

            $scope.update = function () {
                var config = $scope.config;
                if ($scope.isConfigValid()) {
                    $scope.waitingForServerSideProcessingAndThenForResultDialog = true;
                    config.$updateConfig(function () {
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                        ActionResultDialogService.showOkDialog('Update succeeded', $scope);
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                        $scope.waitingForServerSideProcessingAndThenForResultDialog = false;
                    });
                } else {
                    ActionResultDialogService.showWarningDialog('Please correct the validation errors.', $scope);
                }
            };

            $scope.getConfig = function () {
                Admin.getConfig(function (config) {
                    $scope.config = config;
                    Slideshows.query(function (res) {
                        _.forEach(res, function (slideShow) {
                            if (slideShow.name && slideShow.name.length > 24) {
                                slideShow.name = slideShow.name.substring(0, 23) + '...';
                            }
                        });
                        $scope.slideshows = res;
                        if (_.findIndex($scope.slideshows, function (slideShow) {
                                return slideShow._id === config.defaultSlideShowId;
                            }) === -1) {
                            config.defaultSlideShowId = null;
                        }
                    });
                });
            };

            $scope.userSelectedSlideShowsPlayTimeInMinutesValid = function () {
                return !$scope.config || $scope.validateNotPositiveInteger($scope.config.userSelectedSlideShowsPlayTimeInMinutes);
            };

            $scope.nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathyValid = function () {
                return !$scope.config || $scope.validateNotPositiveInteger($scope.config.nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathy);
            };

            $scope.sizeOfAutocompleteListForTagsValid = function () {
                return !$scope.config || $scope.validateNotPositiveInteger($scope.config.sizeOfAutocompleteListForTags);
            };

            $scope.defaultSlideDurationValid = function () {
                return !$scope.config || $scope.validateNotPositiveInteger($scope.config.defaultSlideDuration);
            };

            $scope.validateNotPositiveInteger = function (number) {
                return number % 1 === 0 && number > 0;
            };

            $scope.defaultSlideShowSelected = function () {
                return !$scope.config || $scope.config.defaultSlideShowId !== null;
            };

            $scope.defaultAnimationTypeSelected = function () {
                return !$scope.config || $scope.config.defaultAnimationType !== null;
            };

            $scope.$on('$stateChangeStart', function (event) {
                if ($scope.waitingForServerSideProcessingAndThenForResultDialog) {
                    event.preventDefault();
                }
            });
        }
                                                          ]);

}());
