/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('AddNewSlideController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', '$timeout', 'Templates',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, $timeout, Templates) {
            $scope.newSlideData = {};

            Templates.getAll(function (response) {
                $scope.templates = response;
            });


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

            $scope.templatesFilterParameters = {namesAndTagsFilter: ''};

            $scope.searchTemplates = function () {
                /*TemplatesSearch.search($scope.templatesFilterParameters, function (templates) {
                    $scope.$parent.slides = slides;
                });*/
            };

            $scope.templatesSearchProvider = {
                filterEventName: 'filterTemplatesToBeAddedToSlideShows',
                cacheId: 'templatesToBeAddedToSlideShowsFilter',
                filter: function (templatesFilterParameters) {
                    $scope.searchTemplates();
                },
                getPossibleFilterValues: function (search, callback) {
                    /*SlideBlueprints.getFilteredNamesAndTags({
                        namesAndTagsFilter: search
                    }, function (filterResult) {
                        callback(filterResult);
                    });*/
                }
            };

            $scope.setTemplate = function (template) {
                $scope.newSlideData.templateName = template;
            };

            $scope.searchBlueprints();

            $scope.selectSlide = function (slide) {
                $scope.newSlideData.slide = slide;
                $scope.$close($scope.newSlideData);
            };
        }]);
}());
