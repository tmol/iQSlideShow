/*global _*/

function MeetingRooms($scope, $http, $interval) {
    'use strict';

    var minimumRefreshIntervalSeconds = 10;
    var refreshInterval;

    var statusDescriptions = {
        'available': 'Available',
        'not-available': 'Not available',
        'occupied': 'Occupied'
    };

    var filterListOfRooms = function() {
        $scope.rooms = $scope.allRooms;

        if ($scope.slide.content.city) {
            $scope.rooms = _.filter($scope.rooms, { city: $scope.slide.content.city });
        }

        if ($scope.slide.content.building) {
            $scope.rooms = _.filter($scope.rooms, { building: $scope.slide.content.building });
        }
    };

    var updateListOfRooms = function() {
        $http({
            method: 'GET',
            url: '/meeting-rooms/'
        }).then(function(response) {
            $scope.allRooms = _.map(response.data, function(room) {
                return {
                    name: room.name,
                    city: room.city,
                    building: room.building,
                    status: room.status,
                    statusDescription: statusDescriptions[room.status]
                };
            });

            filterListOfRooms();
        });
    };

    var startRefresh = function(interval) {
        refreshInterval = $interval(updateListOfRooms, interval);
    };

    var stopRefresh = function() {
        $interval.cancel(refreshInterval);

        refreshInterval = null;
    };

    updateListOfRooms();
    startRefresh(minimumRefreshIntervalSeconds * 1000);

    $scope.$watch('slide.content.refreshInterval', function(newValue, oldValue) {
        var interval = parseFloat(newValue);

        if (!interval || interval < minimumRefreshIntervalSeconds) {
            interval  = minimumRefreshIntervalSeconds;
        }

        var restart = function() {
            stopRefresh();
            startRefresh(interval * 1000);

            updateListOfRooms();
        };

        _.debounce(restart, 200)();
    });

    $scope.$watch('slide.content.city', filterListOfRooms);
    $scope.$watch('slide.content.building', filterListOfRooms);
}
