/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('BlueprintsController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', 'slidesConcatenatedTagsListWithLimitedLength', 'ActionResultDialogService',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, slidesConcatenatedTagsListWithLimitedLength, ActionResultDialogService) {
            $scope.filterParameters = {namesAndTagsFilter: ''};

            $scope.search = function () {
                SlideBlueprintsSearch.search($scope.filterParameters, function (slides) {
                    $scope.slides = slides;
                    slidesConcatenatedTagsListWithLimitedLength.format(slides, 45);
                });
            };

            $scope.searchProvider = {
                filterEventName: 'filterBluePrints',
                cacheId: 'bluePrintsFilter',
                filter: function (filterParameters) {
                    $scope.filterParameters = filterParameters;
                    $scope.search();
                },
                getPossibleFilterValues: function (search, callback) {
                    SlideBlueprints.getFilteredNamesAndTags({
                        namesAndTagsFilter: search
                    }, function (filterResult) {
                        callback(filterResult);
                    });
                }
            };

            $scope.removeSlide = function (slide) {
                ActionResultDialogService.showOkCancelDialog('Are you sure do you want to remove the slide?', $scope, function () {
                    SlideBlueprints.delete({slideId: slide._id}, function () {
                        ActionResultDialogService.showOkDialog('Remove succeeded', $scope, function () {
                            $scope.search();
                        });
                    });
                });
            };
        }]);
}());
