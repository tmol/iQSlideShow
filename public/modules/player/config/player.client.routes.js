'use strict';

//Setting up route
angular.module('player').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
        if (window.location.pathname == "/slideshow") {
            $urlRouterProvider.otherwise('/player');
        }
		// Player state routing
		$stateProvider.state('player', {
			url: '/player',
			templateUrl: 'modules/player/views/player.client.view.html',
			controller:'PlayerController'
		});
        $stateProvider.state('preview', {
			url: '/preview/:slideName',
            templateUrl: 'modules/player/views/player.client.view.html',
			controller:'PlayerController'
		});
        $stateProvider.state('deviceInteraction', {
            url: '/deviceInteraction/:deviceId/:slideShowId/:slideNumber',
            templateUrl: 'modules/player/views/deviceInteraction.client.view.html',
            noApplicationHeader: true,
            interactionMode: true
        })
	}
]);
