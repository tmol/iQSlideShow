/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('BlueprintsController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', 'slidesConcatenatedTagsListWithLimitedLength', 'DateFormatter',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, slidesConcatenatedTagsListWithLimitedLength, DateFormatter) {
            $scope.filterParameters = {namesAndTagsFilter: ''};
            $scope.dateFormatter = DateFormatter;

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
                SlideBlueprints.delete({
                    slideId: slide._id
                }, function () {
                    $scope.search();
                });
            };
        }]);
}());
