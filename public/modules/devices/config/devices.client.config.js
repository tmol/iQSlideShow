'use strict';

// Configuring the Articles module
angular.module('devices').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Devices', 'devices', 'item', '', 2);
	}
]);
