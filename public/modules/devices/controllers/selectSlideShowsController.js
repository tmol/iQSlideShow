/*jslint nomen: true, vars: true*/
/*global angular, ApplicationConfiguration, _*/
(function () {
    'use strict';
    angular.module('devices').controller('SelectSlideShowsController', ['$scope', '$stateParams', 'Slideshows',
        function ($scope, $stateParams, Slideshows) {

            $scope.filter = '';

            var processSearchResult = function (slideshows) {
                var resultsToBeDisplayed = _.filter(slideshows, function (slideShow) {
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
            };

            $scope.search = function () {
                Slideshows.filterByName({
                    nameFilter: $scope.filter
                }, function (result) {
                    processSearchResult(result);
                }, function (err) {
                    console.log(err);
                });
            };

            $scope.add = function () {
                var selectedSlideShows = $scope.slideShows.filter(function (device) {
                    return device.checked;
                });
                $scope.$close(selectedSlideShows);
            };

            $scope.$on('domElementScrollBarVisible', function () {
                $scope.scrollBarVisibleInSlideShowsList = true;
            });

            $scope.$watch('filter', function () {
                $scope.search();
            });
        }]);
}());
