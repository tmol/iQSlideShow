/*jslint nomen: true, vars: true*/
/*global _, angular, ApplicationConfiguration*/
(function () {
    'use strict';
    angular.module('blueprints').controller('SlideBlueprintsController', ['$scope', 'Tags', 'SlideBlueprints',
        function ($scope, Tags, SlideBlueprints) {
            $scope.bluePrintInstance = SlideBlueprints.get({slideId: $scope.Slide._id});
            $scope.possibleTags = [];
            $scope.refreshTags = function (text) {
                return Tags.query({tag: text}, function (result) {
                    $scope.possibleTags = _.pluck(result, 'value');
                });
            };
            $scope.save = function () {
                $scope.bluePrintInstance.slide = [$scope.Slide];
                $scope.bluePrintInstance.$save().then(function () {
                    $scope.$close();
                });
            };
        }]);
}());
