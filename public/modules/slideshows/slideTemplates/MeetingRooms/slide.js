/*global _*/

function MeetingRooms($scope, $http, $interval) {
    'use strict';

    var minimumRefreshIntervalSeconds = 10;
    var refreshInterval = minimumRefreshIntervalSeconds;
    var refreshTimer;

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
            url: '/meeting-rooms/',
            params: {
                endpoint: $scope.slide.content.endpoint,
                username: $scope.slide.content.username,
                password: $scope.slide.content.password
            }
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

    var startRefresh = function() {
        refreshTimer = $interval(updateListOfRooms, refreshInterval * 1000);
    };

    var stopRefresh = function() {
        $interval.cancel(refreshTimer);

        refreshTimer = null;
    };

    var restartRefresh = _.debounce(function() {
        stopRefresh();
        startRefresh();

        updateListOfRooms();
    }, 200);

    $scope.$watch('slide.content.refreshTimer', function(newValue, oldValue) {
        refreshInterval = parseFloat(newValue);

        if (!refreshInterval || refreshInterval < minimumRefreshIntervalSeconds) {
            refreshInterval  = minimumRefreshIntervalSeconds;
        }

        restartRefresh();
    });

    $scope.$watch('slide.content.endpoint', restartRefresh);
    $scope.$watch('slide.content.username', restartRefresh);
    $scope.$watch('slide.content.password', restartRefresh);

    $scope.$watch('slide.content.city', filterListOfRooms);
    $scope.$watch('slide.content.building', filterListOfRooms);
}
