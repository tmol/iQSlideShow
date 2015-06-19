'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('player').factory('Slides', ['$resource',
	function($resource) {
		return $resource('/slideshows/:slideId', {slideId:'@_id'});
	}
]);