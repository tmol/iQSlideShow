'use strict';

//Setting up route
angular.module('player').config(['$stateProvider',
	function($stateProvider) {
		// Player state routing
		$stateProvider.
		state('player', {
			url: '/player/:slideName',
			templateUrl: '../modules/player/views/player.client.view.html',
			controller:'PlayerController'
		})
		.state('player.slide', {
			params: {slide: null},
			templateUrl: '../modules/player/views/slide.client.view.html',
			controller:'SlideController'
		});
	}
]);