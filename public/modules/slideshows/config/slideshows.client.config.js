/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Slideshows', 'slideshows', 'dropdown', '/slideshows(/create)?', 1);
            Menus.addSubMenuItem('topbar', 'slideshows', 'List Slideshows', 'slideshows');
            Menus.addSubMenuItem('topbar', 'slideshows', 'New Slideshow', 'slideshows/create');
        }]);
}());
