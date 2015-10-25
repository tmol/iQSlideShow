/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('SelectSlideFromBlueprintsController', ['$scope', 'Tags', 'SlideBlueprints',
        function ($scope, Tags, SlideBlueprints) {
            $scope.filter = "";
            $scope.search = function () {
                SlideBlueprints.getByFilter({filters: [$scope.filter]}, function (result) {
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
            $scope.save = function () {
                $scope.bluePrintInstance.slide = [$scope.Slide];
                $scope.bluePrintInstance.$save().then(function () {
                    $scope.$close(null);
                });
            };
            $scope.selectSlide = function (slide) {
                $scope.$close(slide);
            };
        }]);
}());
