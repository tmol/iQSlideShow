/*global angular, _*/

(function () {
    'use strict';

    angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'Slideshows', 'ActionResultDialogService',
        function ($scope, $stateParams, $location, Authentication, Admin, Slideshows, ActionResultDialogService) {
            $scope.authentication = Authentication;

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
                    config.$updateConfig(function () {
                        ActionResultDialogService.showOkDialog('Update succeeded', $scope);
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
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
        }
                                                          ]);

}());
