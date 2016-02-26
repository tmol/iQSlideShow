/*global angular, _*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('tagAndNameFilter', ['$cacheFactory', function ($cacheFactory) {
    'use strict';

    function link(scope, element, attrs) {
        var setDefaultFilterValuePlaceholder,
            cachedSettings,
            cacheId = 'core.tagAndNameFilter',
            cachedFilterParametersId = cacheId + '.' + scope.searchProvider.cacheId;

        scope.cache = $cacheFactory.get(cacheId);
        if (angular.isUndefined(scope.cache)) {
            scope.cache = $cacheFactory(cacheId);
        }

        var filter = function () {
            scope.filterParameters.nameFilters = _.filter(scope.filterParameters.filterItems, function (filterItem) {
                return filterItem._id !== 'tag';
            });
            scope.filterParameters.nameFilters = _.map(scope.filterParameters.nameFilters, function (nameFilterItem) {
                return nameFilterItem.name;
            });

            scope.filterParameters.tagFilters = _.filter(scope.filterParameters.filterItems, function (filterItem) {
                return filterItem._id === 'tag';
            });
            scope.filterParameters.tagFilters = _.map(scope.filterParameters.tagFilters, function (tagFilterItem) {
                return tagFilterItem.name.slice(1);
            });
            scope.searchProvider.filter(scope.filterParameters);
        };

        scope.filterParameters = scope.cache.get(cachedFilterParametersId);
        if (angular.isUndefined(scope.filterParameters)) {
            scope.filterParameters = {
                namesAndTagsFilter: '',
                filterItems: [],
                filterEventName: scope.searchProvider.filterEventName,
                removeItemFromFilter: function (item) {
                    _.pull(this.filterItems, item);
                    filter();
                },
                isNotEmpty: function () {
                    return this.filterItems.length > 0;
                },
                clear: function () {
                    this.filterItems = [];
                    setDefaultFilterValuePlaceholder();
                    this.namesAndTagsFilter = '';
                    filter();
                }
            };
        }

        setDefaultFilterValuePlaceholder = function () {
            scope.filterValuePlaceholder = 'Search';
        };

        scope.filterValuePlaceholder = '';

        scope.initNamesAndTagsFilter = function (select) {
            select.search = scope.filterParameters.namesAndTagsFilter;
        };

        scope.filterUpdated = function (select) {
            var clickTriggeredTheSelect = select.clickTriggeredSelect === true;

            if (clickTriggeredTheSelect) {
                if (!_.includes(scope.filterParameters.filterItems, scope.filterParameters.namesAndTagsFilter)) {
                    scope.filterParameters.filterItems.push(scope.filterParameters.namesAndTagsFilter);
                }
                scope.filterParameters.namesAndTagsFilter = '';
            } else {
                scope.filterParameters.namesAndTagsFilter = select.placeholder;
            }

            scope.filterValuePlaceholder = select.search;
            filter();
            if (clickTriggeredTheSelect) {
                setDefaultFilterValuePlaceholder();
                scope.filterParameters.namesAndTagsFilter = null;
            }
        };

        scope.possibleFilterValues = [];

        scope.refreshPossibleFilterValues = function (select) {
            scope.filterParameters.namesAndTagsFilter = select.search;

            if (!scope.filterParameters.namesAndTagsFilter || scope.filterParameters.namesAndTagsFilter.length === 0) {
                setDefaultFilterValuePlaceholder();
                scope.possibleFilterValues = [];
                filter();
                return;
            }

            scope.filterValuePlaceholder = select.search;

            var toLowerCase = function (item) {
                return item.name.toLowerCase();
            };

            scope.searchProvider.getPossibleFilterValues(scope.filterParameters.namesAndTagsFilter, function (filterResult) {
                var tags;

                scope.possibleFilterValues = _.sortBy(filterResult.names, toLowerCase);

                tags = _.map(filterResult.tags, function (tag) { return {_id: 'tag', name: '#' + tag }; });
                tags = _.sortBy(tags, toLowerCase);
                scope.possibleFilterValues = scope.possibleFilterValues.concat(tags);
            });
        };

        scope.$on("$destroy", function () {
            scope.cache.put(cachedFilterParametersId, scope.filterParameters);
        });
    }

    return {
        link: link,
        transclude: true,
        templateUrl: 'modules/core/templates/tagAndNameFilter.html',
        scope: {
            label: '=',
            searchProvider: '=',
            hideSummary: '='
        }
    };
}]);
