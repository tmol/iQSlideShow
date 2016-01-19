/*global angular*/
(function () {
    'use strict';
    angular.module('slideshows').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('topbar', 'Slideshows', '', '', '/slideshows', 1);
        }]);
}());
