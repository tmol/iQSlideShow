/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('AddNewSlideController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', '$timeout', 'Templates',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, $timeout, Templates) {
            $scope.newSlideData = {};

            Templates.getAll(function (response) {
                $scope.filteredTemplates = response;
                $scope.templates = response;
            });


            $scope.close = function (template) {
                $scope.$close($scope.newSlideData);
            };

            $scope.blueprintsFilterParameters = {namesAndTagsFilter: ''};

            $scope.searchBlueprints = function () {
                var idx, concatenatedTags;
                SlideBlueprintsSearch.search($scope.blueprintsFilterParameters, function (slides) {
                    $scope.$parent.slides = slides;
                    _(slides).forEach(function (slide) {
                        concatenatedTags = '';
                        _(slide.tags).forEach(function (tag) {
                            if (concatenatedTags.length > 0) {
                                concatenatedTags = concatenatedTags + ' ';
                            }
                            concatenatedTags = concatenatedTags + tag;
                        });
                        if (concatenatedTags.length > 35) {
                            concatenatedTags = concatenatedTags.substring(0, 32);
                            concatenatedTags = concatenatedTags + '...';

                        }
                        slide.concatenatedTags = concatenatedTags;
                    });
                });
            };

            $scope.blueprintsSearchProvider = {
                filterEventName: 'filterBluePrintsToBeAddedToSlideShows',
                cacheId: 'bluePrintsToBeAddedToSlideShowsFilter',
                filter: function (blueprintsFilterParameters) {
                    $scope.blueprintsFilterParameters = blueprintsFilterParameters;
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

            $scope.templatesFilterParameters = {namesAndTagsFilter: '', noFilterSummary: true};

            function executeTemplatesSearch(search) {
                search = _.toLower(search);

                var filterResult = _.filter($scope.templates, function (aTemplate) {
                    return _.startsWith(_.toLower(aTemplate), search);
                });

                return filterResult;
            }

            $scope.searchTemplates = function (search) {
                $scope.filteredTemplates = executeTemplatesSearch(search);
            };

            $scope.templatesSearchProvider = {
                filterEventName: 'filterTemplatesToBeAddedToSlideShows',
                cacheId: 'templatesToBeAddedToSlideShowsFilter',
                filter: function (templatesFilterParameters) {
                    $scope.searchTemplates(templatesFilterParameters.namesAndTagsFilter);
                },
                getPossibleFilterValues: function (search, callback) {
                    var searchResult = executeTemplatesSearch(search);
                    searchResult = _.map(searchResult, function (item) {
                        return ({name : item});
                    });
                    callback({names: searchResult});
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
