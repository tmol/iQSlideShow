/*global angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('SelectSlideFromRepositoryController', ['$scope', 'Tags', 'SlidesRepository',
        function ($scope, Tags, SlidesRepository) {
            $scope.filter = "";
            $scope.search = function () {
                SlidesRepository.getByFilter({filters: [$scope.filter]}, function (result) {
                    $scope.slides = result.map(function (item) {
                        var slide = item.slide[0];
                        slide.repoTitle = item.name;
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
                $scope.repoInstance.slide = [$scope.Slide];
                $scope.repoInstance.$save().then(function () {
                    $scope.$close(null);
                });
            };
            $scope.selectSlide = function (slide) {
                $scope.$close(slide);
            };
        }]);
}());
