/*jslint nomen: true, vars: true*/
/*global angular, alert, _*/
(function () {
    'use strict';

    // Slideshows controller
    angular.module('slideshows').controller('SlideshowsListController', ['$scope', '$location', 'Slideshows', '$timeout', 'ServerMessageBroker', 'Path', '$cacheFactory',
        function ($scope, $location, Slideshows, $timeout, ServerMessageBroker, Path, $cacheFactory) {

            var serverMessageBroker = new ServerMessageBroker();

            $scope.remove = function (slideshow) {
                slideshow.$remove();
                var i;
                for (i in $scope.slideshows) {
                    if ($scope.slideshows[i] === slideshow) {
                        $scope.slideshows.splice(i, 1);
                    }
                }
            };

            // todo what happens when error occures?
            $scope.publishById = function (id) {
                serverMessageBroker
                    .publishSlideShow(id)
                    .then(function () {
                        alert("Published");
                    });
            };

            $scope.navigateToCreateNewSlideShow = function () {
                $location.path('/slideshows/new/edit');
            };

            $scope.cache = $cacheFactory.get('slideshows.client.controller');
            if (angular.isUndefined($scope.cache)) {
                $scope.cache = $cacheFactory('slideshows.client.controller');
            }

            $scope.searchProvider = {
                filterEventName: 'filterSlideShows',
                cacheId: 'slideShowsFilter',
                filter: function (filterParameters) {
                    $scope.filterParameters.namesAndTagsFilterParameters = filterParameters;
                    $scope.filterSlideShows();
                },
                getPossibleFilterValues: function (search, callback) {
                    Slideshows.getFilteredNamesAndTags({
                        showOnlyMine: $scope.filterParameters.showOnlyMine,
                        namesAndTagsFilter: search
                    }, function (filterResult) {
                        callback(filterResult);
                    });
                }
            };

            $scope.filterParameters = $scope.cache.get('slideshows.client.controller.filterParameters');
            if (angular.isUndefined($scope.filterParameters)) {
                $scope.filterParameters = {
                    showOnlyMine: false,
                    pageSize: 12,
                    fullyLoaded: false,
                    namesAndTagsFilterParameters: {}
                };
            }

            $scope.$watch('filterParameters.showOnlyMine', function (oldValue, newValue) {
                if (oldValue !== newValue) {
                    $scope.filterSlideShows();
                }
            });

            function executeFilter(callback) {
                Slideshows.filter({
                    showOnlyMine: $scope.filterParameters.showOnlyMine,
                    pageSize: $scope.filterParameters.pageSize,
                    lastPageLastItemCreated: $scope.filterParameters.lastPageLastItemCreated,
                    nameFilters: $scope.filterParameters.namesAndTagsFilterParameters.nameFilters,
                    tagFilters: $scope.filterParameters.namesAndTagsFilterParameters.tagFilters,
                    namesAndTagsFilter: $scope.filterParameters.namesAndTagsFilterParameters.namesAndTagsFilter
                }, function (result) {
                    if (result.length > 0) {
                        $scope.filterParameters.lastPageLastItemCreated = _.last(result).created;
                    }
                    if (result.length < $scope.filterParameters.pageSize) {
                        $scope.filterParameters.fullyLoaded = true;
                    }
                    $timeout(function () {
                        callback(result);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }

            $scope.filterSlideShows = function (scrolling) {
                delete $scope.filterParameters.lastPageLastItemCreated;
                delete $scope.filterParameters.fullyLoaded;
                executeFilter(function (results) {
                    results.splice(0, 0, { isPlacheloderForCreateNew: true});
                    $scope.slideshows = results;
                });
            };

            $scope.getNextChunk = function () {
                if ($scope.filterParameters.fullyLoaded) {
                    return;
                }
                executeFilter(function (results) {
                    var concatenatedSlideshows = _($scope.slideshows).concat(results).value();
                    $scope.slideshows = concatenatedSlideshows;
                });
            };

            $scope.$on("$destroy", function () {
                $scope.cache.put('slideshows.client.controller.filterParameters', $scope.filterParameters);
            });
        }]);
}());
