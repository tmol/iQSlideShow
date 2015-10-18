/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('slideshows').controller('SlidesRepositoryController', ['$scope', 'Tags', 'SlidesRepository',
        function ($scope, Tags, SlidesRepository) {
            $scope.repoInstance = SlidesRepository.get({slideId: $scope.Slide._id});
            $scope.possibleTags = [];
            $scope.refreshTags = function (text) {
                return Tags.query({tag: text}, function (result) {
                    $scope.possibleTags = _.pluck(result, 'value');
                });
            };
            $scope.save = function () {
                $scope.repoInstance.slide = [$scope.Slide];
                $scope.repoInstance.$save().then(function () {
                    $scope.$close();
                });
            };
        }]);
}());
