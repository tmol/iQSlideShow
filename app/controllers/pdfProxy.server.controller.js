/*global require, exports, mongoose*/
/*jslint regexp: true*/
(function () {
    'use strict';

    var errorHandler = require('./errors.server.controller');
    var http = require('http');
    var https = require('https');
    var querystring = require('querystring');

    var handleException = function (context, exception, res) {
        var message = exception.message || exception;
        console.log("Got error during " + context + " : " + message);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(exception)
        });
    };

    exports.getPdf = function (req, res) {
        var pdfUrl = req.params.pdfUrl;

        var isHttps = pdfUrl.slice(0, 'https'.length) === 'https';
        var protocoll = isHttps ? https : http;
        var host = pdfUrl.match(/:\/\/(.*?)\//)[1];
        console.log('host:' + host);
        var getOptions = {
            host: host,
            path:  pdfUrl,
            method: 'GET',
            headers: {
				'Accept-Encoding': 'gzip, deflate, sdch',
				'Accept': '*/*'
            }
        };
        protocoll.get(getOptions, function (result) {
            var data = [];

            result.on('data', function (chunk) {
                data.push(new Buffer(chunk));
            });

            result.on('end', function (chunk) {
                var jsfile = new Buffer.concat(data);
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.header('content-type', 'application/pdf');
                res.send(jsfile);
            });
        }).on('error', function (e) {
            handleException("getting pdf with url " + pdfUrl, e, res);
        });
    };

    exports.hasAuthorization = function (req, res, next) {
        next();
    };
}());
