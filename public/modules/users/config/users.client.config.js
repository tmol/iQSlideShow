'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication', 'Base64',
			function($q, $location, Authentication, base64) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
                                var currentLocation = $location.$$absUrl;
                                var encodedLocation = base64.encode(currentLocation);
                                if (currentLocation.split("/signin/").length > 1) {
                                    return;
                                }

								$location.path('signin/' + encodedLocation);
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
