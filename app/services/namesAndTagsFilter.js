/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    var lodash = require('lodash'),
        Promise = require('Promise');

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
            tagsRegExp = '.*' + namesAndTagsFilter + '.*';

        if (namesAndTagsFilter !== null && namesAndTagsFilter.length > 0) {
            select = {name : { $regex: '^' + namesAndTagsFilter, $options: 'i' }};
            promise = preparePromiseForFilter(select, req, function (itemsFound) {
                filterResult.names =  lodash.map(lodash.uniq(itemsFound), mapItemToFilteredName);
            });
            promises.push(promise);

            select = {tags : { $elemMatch: {$regex: tagsRegExp, $options: 'i' }}};
            promise = preparePromiseForFilter(select, req, function (itemsFound) {
                filterResult.tags = lodash.map(itemsFound, mapItemToTags);
                filterResult.tags = lodash.flatten(filterResult.tags);
                filterResult.tags = lodash.uniq(filterResult.tags);
                filterResult.tags = lodash.filter(filterResult.tags, function (tag) {
                    return tag.match(new RegExp(tagsRegExp, 'i'));
                });
            });
            promises.push(promise);
        }

        Promise.all(promises).then(function () {
            success(filterResult);
        }, function (error) {
            error(error);
        });
    };

    var concatUnique = function (slideshows, foundSlideShows) {
        return lodash.uniq(slideshows.concat(foundSlideShows));
    };

    var ensureArray = function (object) {
        if (!lodash.isArray(object)) {
            return [object];
        }
        return object;
    };

    exports.filter = function (req, preparePromiseForFilter, success, error) {
        var nameFilters = req.query.nameFilters,
            tagFilters = req.query.tagFilters,
            tagAndNameFilter = req.query.namesAndTagsFilter,
            select = {},
            promise,
            items = [],
            promises = [];

        if (tagAndNameFilter && tagAndNameFilter.length > 0) {
            select = {
                name : { $regex: '^' + tagAndNameFilter, $options: 'i' },
                tags : { $elemMatch: {$regex: '.*' + tagAndNameFilter + '.*', $options: 'i' }}
            };
            promise = preparePromiseForFilter(select, req, function (foundItems) {
                items = concatUnique(items, foundItems);
            });
            promises.push(promise);
        }

        if (nameFilters && nameFilters.length > 0) {
            nameFilters = ensureArray(nameFilters);
            select = {name : {$in: nameFilters }};
            promise = preparePromiseForFilter(select, req, function (foundItems) {
                items = concatUnique(items, foundItems);
            });
            promises.push(promise);
        }

        if (tagFilters && tagFilters.length > 0) {
            tagFilters = ensureArray(tagFilters);
            select = {tags : {$in: tagFilters }};
            promise = preparePromiseForFilter(select, req, function (foundItems) {
                items = concatUnique(items, foundItems);
            });
            promises.push(promise);
        }

        if (lodash.keys(select).length === 0) {
            promise = preparePromiseForFilter({}, req, function (foundItems) {
                items = concatUnique(items, foundItems);
            });
            promises.push(promise);
        }

        Promise.all(promises).then(function () {
            success(items);
        }, function (error) {
            error(error);
        });
    };

}());
