/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('AddNewSlideController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', '$timeout',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, $timeout) {
            $scope.newSlideData = {};

            $scope.close = function (template) {
                $scope.$close($scope.newSlideData);
            };

            $scope.blueprintsFilterParameters = {namesAndTagsFilter: ''};

            $scope.searchBlueprints = function () {
                SlideBlueprintsSearch.search($scope.blueprintsFilterParameters, function (slides) {
                    $scope.$parent.slides = slides;
                });
            };

            $scope.blueprintsSearchProvider = {
                filterEventName: 'filterBluePrintsToBeAddedToSlideShows',
                cacheId: 'bluePrintsToBeAddedToSlideShowsFilter',
                filter: function (blueprintsFilterParameters) {
                    $scope.filterParameters = blueprintsFilterParameters;
                    $scope.searchBlueprints();
                },
                getPossibleFilterValues: function (search, callback) {
                    SlideBlueprints.getFilteredNamesAndTags({
                        namesAndTagsFilter: search
                    }, function (filterResult) {
                        callback(filterResult);
                    });
                }
            };

            $scope.searchBlueprints();

            $scope.selectSlide = function (slide) {
                $scope.newSlideData.slide = slide;
                $scope.$close($scope.newSlideData);
            };
        }]);
}());
