/*global angular*/
(function () {
    'use strict';
    // Configuring the Articles module
    angular.module('slideshows').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Slideshows', 'slideshows', 'dropdown', '/slideshows(/create)?');
            Menus.addSubMenuItem('topbar', 'slideshows', 'List Slideshows', 'slideshows');
            Menus.addSubMenuItem('topbar', 'slideshows', 'New Slideshow', 'slideshows/create');
        }]);
}());
