'use strict';

//Setting up route
angular.module('player').config(['$stateProvider',
	function($stateProvider) {
		// Player state routing
		$stateProvider.state('player', {
			url: '/player/:slideName/:slideNumber/:preview',
            params: {deviceId: null, deviceSetupMessage: null},
			templateUrl: 'modules/player/views/player.client.view.html',
			controller:'PlayerController'
		});
	}
]);
