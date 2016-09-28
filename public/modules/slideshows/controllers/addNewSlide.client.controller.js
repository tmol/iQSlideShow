/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('slideshows').controller('AddNewSlideController', ['$scope', 'Tags', 'SlideBlueprints', 'SlideBlueprintsSearch', '$timeout', 'Templates', 'slidesConcatenatedTagsListWithLimitedLength',
        function ($scope, Tags, SlideBlueprints, SlideBlueprintsSearch, $timeout, Templates, slidesConcatenatedTagsListWithLimitedLength) {
            $scope.newSlideData = {};

            var getSlides = function(templates) {
                return _.map(templates, function(item) {
                    return {
                        templateName: item, resolution: {width: 1600, height: 900}
                    }
                })
            }
            Templates.getAll(function (response) {
                $scope.filteredTemplates = getSlides(response);
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
                    slidesConcatenatedTagsListWithLimitedLength.format(slides, 25);
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
                    var regExp = new RegExp('.*' + search + '.*', 'i');
                    return regExp.test(_.toLower(aTemplate));
                });

                return filterResult;
            }

            $scope.searchTemplates = function (search) {
                var templates = executeTemplatesSearch(search);
                $scope.filteredTemplates = getSlides(templates);
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
