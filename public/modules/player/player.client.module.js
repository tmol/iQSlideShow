/*global ApplicationConfiguration*/
(function () {
    'use strict';

    // Use application configuration module to register a new module
    ApplicationConfiguration.registerModule('player', ['core','devices']);
}());