/*jslint nomen: true, vars: true, unparam: true*/
/*global module, require*/
(function () {
    'use strict';

    module.exports = function (app) {
        var users = require('../../app/controllers/users.server.controller');
        var devices = require('../../app/controllers/devices.server.controller');

        // Devices Routes
        app.route('/devices')
            .get(users.requiresLogin, devices.list);

        app.route('/devices/names/:nameFilter')
            .get(users.requiresLogin, devices.getFilteredNames)

        app.route('/devices/healthReport/:deviceId')
            .post(devices.healthReport);

        app.route('/devices/:deviceId')
            .get(devices.read)
            .put(users.requiresLogin, devices.hasAuthorization, devices.update)
            .delete(users.requiresLogin, devices.hasAuthorization, devices.delete);

        app.route('/devices/:deviceWithSlidesid/slides')
            .get(devices.getSlides);

        app.route('/devices/byLocation/:locationName')
            .get(users.requiresLogin, devices.hasAuthorization, devices.getDevicesByLocation);

        // Finish by binding the Device middleware
        app.param('deviceId', devices.deviceByID);
        app.param('deviceWithSlidesid', devices.deviceWithSlidesByID);
        app.param('locationName', devices.devicesByLocation);
        app.param('nameFilter', devices.filteredNames);
    };
}());
