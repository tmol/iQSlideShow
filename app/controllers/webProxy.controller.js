/*jslint nomen: true, vars: true, unparam: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    var http = require('http'),
        https = require('https');
    exports.proxy = function (client_req, client_res) {
        var options = client_req.body;
        console.log(options);
        var protocol = options.protocol === 'https:' ? https : http;

        var proxy = protocol.request(options, function (res) {
            res.pipe(client_res, {
                end: true
            });
        });

        client_req.pipe(proxy, {
            end: true
        });
    };
}());
