'use strict';

//Devices service used to communicate Devices REST endpoints
angular.module('slideshows').factory('Devices', ['$resource',
	function($resource) {
		return $resource('devices',  {
            getDevices: { method: 'GET', isArray: true }
        });
	}
]);