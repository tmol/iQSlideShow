/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('SelectSlideFromBlueprintsController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch) {
            $scope.filterParameters = {namesAndTagsFilter: ''};

            $scope.search = function () {
                SlideBlueprintsSearch.search($scope);
            };

            $scope.searchProvider = {
                filterEventName: 'filterBluePrintsToBeAddedToSlideShows',
                cacheId: 'bluePrintsToBeAddedToSlideShowsFilter',
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

            $scope.search();
            $scope.save = function () {
                $scope.bluePrintInstance.slide = [$scope.Slide];
                $scope.bluePrintInstance.$save().then(function () {
                    $scope.$close(null);
                });
            };
            $scope.selectSlide = function (slide) {
                $scope.$close(slide);
            };
        }]);
}());
