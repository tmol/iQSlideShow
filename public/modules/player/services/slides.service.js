'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('player').factory('Slides', ['$resource',
	function($resource) {
		return $resource('/slides/:slideId', {slideId:'@id'});
	}
]);