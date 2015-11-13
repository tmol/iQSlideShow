/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('BlueprintsController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch) {
            $scope.filterParameters = {namesAndTagsFilter: ''};

            $scope.search = function () {
                SlideBlueprintsSearch.search($scope);
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
            $scope.search();

            $scope.removeSlide = function (slide) {
                SlideBlueprints.delete({
                    slideId: slide._id
                }, function () {
                    $scope.search();
                });
            };
        }]);
}());
