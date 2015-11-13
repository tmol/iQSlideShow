/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('BlueprintsController', ['$scope', 'Tags', 'SlideBlueprints',
        function ($scope, Tags, SlideBlueprints) {
            $scope.filterParameters = {namesAndTagsFilter: ''};
            $scope.search = function () {
                SlideBlueprints.getByFilter({
                    nameFilters: $scope.filterParameters.nameFilters,
                    tagFilters: $scope.filterParameters.tagFilters,
                    namesAndTagsFilter:  $scope.filterParameters.namesAndTagsFilter
                }, function (result) {
                    $scope.slides = result.map(function (item) {
                        var slide = item.slide[0];
                        slide.bluePrintTitle = item.name;
                        if (item.user) {
                            slide.publisher = item.user.displayName;
                        }
                        slide.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                        return item.slide[0];
                    });
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
