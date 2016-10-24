/*global _*/

function MeetingRooms($scope, $http, $interval) {
    'use strict';

    var refreshInterval = 10000;

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

    updateListOfRooms();
    $interval(updateListOfRooms, refreshInterval);
}
