/*global angular*/
(function () {
    'use strict';

    // Configuring the Articles module
    angular.module('admin').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '', 4);
            Menus.addSubMenuItem('topbar', 'admin', 'Config', 'admin');
            Menus.addSubMenuItem('topbar', 'admin', 'Reload', 'reload');
            Menus.addSubMenuItem('topbar', 'admin', 'Locations', 'locations');
            Menus.addSubMenuItem('topbar', 'admin', 'Audit', 'audit');

            // Set user settings menu items
            Menus.addMenuItem('settings', 'Settings', 'settings', 'dropdown');
            Menus.addSubMenuItem('settings', 'settings', 'Edit Profile', 'settings/profile');
            Menus.addSubMenuItem('settings', 'settings', 'Change Password', 'settings/password');
        }
    ]);
}());
