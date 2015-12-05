'use strict';

module.exports = function (app) {
    var webProxy = require('../../app/controllers/webProxy.controller');
    app.route('/proxy')
        .post(webProxy.proxy);
};
