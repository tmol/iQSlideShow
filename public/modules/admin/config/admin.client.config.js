/*global angular*/
(function () {
    'use strict';

    // Configuring the Articles module
    angular.module('admin').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '');
            Menus.addSubMenuItem('topbar', 'admin', 'Config', 'admin');
            Menus.addSubMenuItem('topbar', 'admin', 'Reload', 'reload');
            Menus.addSubMenuItem('topbar', 'admin', 'Locations', 'locations');
            Menus.addSubMenuItem('topbar', 'admin', 'Audit', 'audit');
        }
        ]);
}());
