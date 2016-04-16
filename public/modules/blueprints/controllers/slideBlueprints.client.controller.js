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
                    $scope.possibleTags = _.map(result, 'value');
                });
            };

            $scope.errMessage = '';
            $scope.save = function () {
                $scope.errMessage = '';
                $scope.bluePrintInstance.slide = [_.cloneDeep($scope.Slide)];
                $scope.bluePrintInstance.slide[0].title = $scope.bluePrintInstance.name;
                $scope.bluePrintInstance.created = Date.now();
                $scope.bluePrintInstance.$save().then(function () {
                    $scope.$close();
                }, function (err) {
                    $scope.errMessage = err.data.message;
                });
            };
        }]);
}());
