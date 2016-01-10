/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Slideshows', '', 'dropdown', '/slideshows(/create)?', 1);
            Menus.addSubMenuItem('topbar', '', 'List Slideshows', 'slideshows');
            Menus.addSubMenuItem('topbar', '', 'New Slideshow', 'slideshows/create');
        }]);
}());
