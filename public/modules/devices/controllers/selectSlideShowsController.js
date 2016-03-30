/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('devices').controller('SelectSlideShowsController', ['$scope', '$stateParams', 'Slideshows',
        function ($scope, $stateParams, Slideshows) {

            $scope.search = function () {
                Slideshows.filter({
                    showOnlyMine: false,
                    nameFilters: $scope.filter
                }, function (result) {
                    var resultsToBeDisplayed = _.filter(result, function (slideShow) {
                        var slideShowAlreadySelected = _.find($scope.device.slideAgregation.playList, function (playedItem) {
                                if (playedItem.slideShow._id === slideShow._id) {
                                    return true;
                                }
                            });
                        if (!slideShowAlreadySelected) {
                            slideShow.lowerCaseName = _.lowerCase(slideShow.name);
                            return true;
                        }
                        return false;
                    });
                    $scope.slideShows = _.orderBy(resultsToBeDisplayed, 'lowerCaseName', 'asc');
                });
            };

            $scope.add = function () {
                var selectedSlideShows = $scope.slideShows.filter(function (device) {
                    return device.checked;
                });
                $scope.$close(selectedSlideShows);
            };

            $scope.$on('devicesToPlayOnDivScrollBarVisible', function () {
                $scope.scrollBarVisibleInSlideShowsList = true;
            });

            $scope.$watch('filter', function () {
                $scope.search();
            });

            $scope.search();
        }]);
}());
