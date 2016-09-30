/*global angular, _*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('tagAndNameFilter', ['$cacheFactory', '$timeout', function ($cacheFactory, $timeout) {
    'use strict';

    function link(scope, element, attrs) {
        var cachedSettings,
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
                    this.namesAndTagsFilter = '';
                    filter();
                }
            };
        }

        scope.filterValuePlaceholder = '';

        scope.initNamesAndTagsFilter = function (select) {
            select.search = scope.filterParameters.namesAndTagsFilter;
        };

        scope.filterUpdated = function (select) {
            var clickTriggeredTheSelect = select.clickTriggeredSelect === true;

            if (!scope.noSummary) {
                if (clickTriggeredTheSelect) {
                    if (!_.includes(scope.filterParameters.filterItems, scope.filterParameters.namesAndTagsFilter)) {
                        scope.filterParameters.filterItems.push(scope.filterParameters.namesAndTagsFilter);
                    }
                    scope.filterParameters.namesAndTagsFilter = '';
                    
                    // HACK: Fix IQSLDSH-367; ui-select will be completely replaced in the future
                    select.search = "";
                } else {
                    scope.filterParameters.namesAndTagsFilter = select.search;
                }
            } else {
                if (clickTriggeredTheSelect) {
                    scope.filterParameters.namesAndTagsFilter = scope.filterParameters.namesAndTagsFilter.name;
                    
                    // HACK: Fix IQSLDSH-367; ui-select will be completely replaced in the future
                    select.search = "";
                } else {
                    scope.filterParameters.namesAndTagsFilter = select.search;
                }
            }

            scope.filterValuePlaceholder = select.search;
            filter();
            if (clickTriggeredTheSelect && !scope.noSummary) {
                scope.filterParameters.namesAndTagsFilter = null;
            }
        };

        scope.possibleFilterValues = [];

        scope.refreshPossibleFilterValues = function (select) {
            scope.filterParameters.namesAndTagsFilter = select.search;

            if (!scope.filterParameters.namesAndTagsFilter || scope.filterParameters.namesAndTagsFilter.length === 0) {
                scope.possibleFilterValues = [];
                filter();
                return;
            }

            scope.filterValuePlaceholder = select.search;

            var toLowerCase = function (item) {
                return item.name.toLowerCase();
            };

            var excluded = _.uniq(_.concat(scope.filterParameters.nameFilters, scope.filterParameters.tagFilters));

            scope.searchProvider.getPossibleFilterValues(scope.filterParameters.namesAndTagsFilter, excluded, function (filterResult) {
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

        // HACK: Fix IQSLDSH-367; ui-select will be completely replaced in the future
        $timeout(function () {
            element.find('.ui-select-search').click(function() {
                element.find('.ui-select-toggle').click();
            });
        }, 0, false);
    }

    return {
        link: link,
        transclude: true,
        templateUrl: 'modules/core/templates/tagAndNameFilter.html',
        scope: {
            label: '=',
            searchProvider: '=',
            noSummary: '='
        }
    };
}]);
