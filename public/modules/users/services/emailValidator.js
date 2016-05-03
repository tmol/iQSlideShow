'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('EmailValidator',
	function($resource) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return {
            validate: function (email) {
                return email && re.test(email);
            }
        };
	}
);
