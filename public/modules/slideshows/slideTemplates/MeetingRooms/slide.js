/*global _*/

function MeetingRooms($scope, $http, $interval) {
    'use strict';

    var refreshInterval = 5000;

    var statusDescriptions = {
        'available': 'Available',
        'not-available': 'Not available',
        'occupied': 'Occupied'
    };

    var testRooms = [{
        roomName: 'Room 1',
        status: 'available',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 2',
        status: 'not available',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 3',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 4',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 5',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 6',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 7',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 8',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 9',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    },{
        roomName: 'Room 10',
        status: 'occupied',
        city: 'Cluj',
        building : 'Motilor'
    }];

    var updateListOfRooms = function() {
        $http({
            method: 'GET',
            url: '/meeting-rooms/'
        }).then(function(response) {
            var rooms = _.concat(response.data, testRooms);

            $scope.rooms = _.map(rooms, function(room) {
                var status = room.status === 'not available' ? 'not-available' : room.status;
                var location = room.city;

                if (room.building) {
                    location += ', ' + room.building;
                }

                return {
                    name: room.roomName,
                    location: location,
                    status: status,
                    statusDescription: statusDescriptions[status]
                };
            });
        });
    };

    updateListOfRooms();
    $interval(updateListOfRooms, refreshInterval);
}
