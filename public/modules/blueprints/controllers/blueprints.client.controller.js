/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('BlueprintsController', ['$scope', 'Tags', 'SlideBlueprints',
        function ($scope, Tags, SlideBlueprints) {
            $scope.filter = "";
            $scope.search = function () {
                SlideBlueprints.getByFilter({
                    filters: [$scope.filter]
                }, function (result) {
                    $scope.slides = result.map(function (item) {
                        var slide = item.slide[0];
                        slide.bluePrintTitle = item.name;
                        if (item.user) {
                            slide.publisher = item.user.displayName;
                        }
                        slide.templateUrl = 'modules/slideshows/slideTemplates/' + (slide.templateName || 'default') + '/slide.html';
                        return item.slide[0];
                    });
                });
            };
            $scope.search();

            $scope.removeSlide = function (slide) {
                SlideBlueprints.delete({
                    slideId: slide._id
                }, function () {
                    $scope.search();
                });
            };
        }]);
}());
