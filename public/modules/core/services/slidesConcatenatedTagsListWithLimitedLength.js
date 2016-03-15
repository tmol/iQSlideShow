/*global angular, _*/
(function () {
    'use strict';

    angular.module('core').service('slidesConcatenatedTagsListWithLimitedLength',
        function () {

            var format = function (slides, maxConcatenatedTagsLength) {
                var concatenatedTags;

                _(slides).forEach(function (slide) {
                    concatenatedTags = '';
                    _(slide.tags).forEach(function (tag) {
                        if (concatenatedTags.length > 0) {
                            concatenatedTags = concatenatedTags + ' ';
                        }
                        concatenatedTags = concatenatedTags + tag;
                    });
                    if (concatenatedTags.length > maxConcatenatedTagsLength) {
                        concatenatedTags = concatenatedTags.substring(0, maxConcatenatedTagsLength);
                        concatenatedTags = concatenatedTags + '...';
                    }
                    slide.concatenatedTags = concatenatedTags;
                });
            };

            return {
                format: format
            };
        });
}());
