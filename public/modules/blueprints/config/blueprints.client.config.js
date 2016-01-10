/*global angular*/
(function () {
    'use strict';

    // Configuring the Articles module
    angular.module('admin').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Blueprints', 'blueprints', 'item', '', 3);
        }
        ]);
}());
