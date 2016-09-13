/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    var lodash = require('lodash'),
        mongoose = require('mongoose'),
        Promise = require('promise'),
        Config = mongoose.model('Config'),
        FindInStringRegex = require('../services/findInStringRegex');

    var mapItemToTags = function (item) {
        return item.tags;
    };

    var mapItemToFilteredName = function (item) {
        return {_id: item._id, name: item.name};
    };

    exports.getFilteredNamesAndTags = function (req, preparePromiseForFilter, success, error) {
        var select = {},
            promises = [],
            promise,
            filterResult = { names: [], tags: [] },
            namesAndTagsFilter = req.query.namesAndTagsFilter,
            tagsRegExp = FindInStringRegex.getFindInTextRegExp(namesAndTagsFilter);

        if (namesAndTagsFilter !== null && namesAndTagsFilter.length > 0) {
            select = {name : tagsRegExp};
            promise = preparePromiseForFilter(select, req, function (itemsFound) {
                filterResult.names =  lodash.map(lodash.uniq(itemsFound), mapItemToFilteredName);
            });
            promises.push(promise);

            select = {tags : { $elemMatch: {$regex: '.*' + namesAndTagsFilter + '.*', $options: 'i' }}};
            promise = preparePromiseForFilter(select, req, function (itemsFound) {
                filterResult.tags = lodash.map(itemsFound, mapItemToTags);
                filterResult.tags = lodash.flatten(filterResult.tags);
                filterResult.tags = lodash.uniq(filterResult.tags);
                filterResult.tags = lodash.filter(filterResult.tags, function (tag) {
                    return tag.match(tagsRegExp);
                });
            });
            promises.push(promise);
        }

        Promise.all(promises).then(function () {
            Config.findOne(function (err, config) {
                if (err) {
                    error(err);
                    return;
                }
                if (config !== null) {
                    // This is not ideal; all the results will be loaded and filtered in memory.
                    filterResult.names = lodash.take(filterResult.names, config.sizeOfAutocompleteListForTags);
                    filterResult.tags = lodash.take(filterResult.tags, config.sizeOfAutocompleteListForTags);
                }
                success(filterResult);
            });
        }, function (error) {
            error(error);
        });
    };

    var concatUnique = function (items, foundItems) {
        var ids = lodash.map(items, function (item) { return item._id.id; });
        lodash.forEach(foundItems, function (item) {
            if (!lodash.include(ids, item._id.id)) {
                items.push(item);
            }
        });
        return items;
    };

    var ensureArray = function (object) {
        if (!lodash.isArray(object)) {
            return [object];
        }
        return object;
    };

    exports.filter = function (req, collection, selectAdjuster, success, error) {
        var nameFilters = req.query.nameFilters,
            tagFilters = req.query.tagFilters,
            namesAndTagsFilter = req.query.namesAndTagsFilter,
            lastPageLastItemCreated = req.query.lastPageLastItemCreated,
            limit = req.query.pageSize,
            select = {},
            promise,
            items = [],
            promises = [];

        if (namesAndTagsFilter && namesAndTagsFilter.length > 0) {
            select = { $or: [
                {name : FindInStringRegex.getFindInTextRegExp(namesAndTagsFilter)},
                {tags : { $elemMatch: new RegExp('.*' + namesAndTagsFilter + '.*', 'i')}}
            ]
                };
        }

        if (nameFilters && nameFilters.length > 0) {
            nameFilters = ensureArray(nameFilters);
            select.name = nameFilters;
        }

        if (tagFilters && tagFilters.length > 0) {
            tagFilters = ensureArray(tagFilters);
            select.tags = { $all: tagFilters };
        }

        if (lastPageLastItemCreated) {
            select.created = { $lt : new Date(lastPageLastItemCreated)};
        }
        console.log('lastPageLastItemCreated: ' + lastPageLastItemCreated);

        console.log('************************select is ');
        console.log(JSON.stringify(select));
        console.log('************************');
        console.log('limit: ' + limit);

        if (!limit) {
            limit = 0;
        }

        if (selectAdjuster) {
            select = selectAdjuster(select);
        }
        collection.find(select).sort('-created').limit(limit).populate('user', 'displayName').exec(function (err, itemsFound) {
            if (err) {
                error(err);
                return;
            }

            success(itemsFound);
        });
    };

}());
