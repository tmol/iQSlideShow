/*global angular*/
(function () {
    'use strict';

    angular.module('blueprints').factory('SlideBlueprintsSearch', ['SlideBlueprints',
        function (SlideBlueprints) {
            return {
                search: function (scope) {
                    SlideBlueprints.getByFilter({
                        nameFilters: scope.filterParameters.nameFilters,
                        tagFilters: scope.filterParameters.tagFilters,
                        namesAndTagsFilter: scope.filterParameters.namesAndTagsFilter
                    }, function (result) {
                        scope.slides = result.map(function (item) {
                            var slide = item.slide[0];
                            slide.bluePrintTitle = item.name;
                            slide.tags = item.tags;
                            if (item.user) {
                                slide.publisher = item.user.displayName;
                            }
                            slide.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                            return item.slide[0];
                        });
                    });
                }
            };
        }]);
}());
