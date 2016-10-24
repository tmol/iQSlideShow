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

    var updateListOfRooms = function() {
        $http({
            method: 'GET',
            url: '/meeting-rooms/'
        }).then(function(response) {
            $scope.rooms = _.map(response.data, function(room) {
                return {
                    name: room.name,
                    location: room.city + ', ' + room.building,
                    status: room.status,
                    statusDescription: statusDescriptions[room.status]
                };
            });
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
        };

        _.debounce(restart, 200)();
    });
}
