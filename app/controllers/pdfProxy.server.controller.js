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

        var getOptions = {
            path:  pdfUrl,
            method: 'GET',
            headers: {
				'Accept-Encoding': 'gzip, deflate, sdch',
				'Accept': '*/*'
            }
        };
        https.get(getOptions, function (result) {
            var data = [];

            //result.setEncoding('binary');

            result.on('data', function (chunk) {
                data.push(new Buffer(chunk));
            });

            result.on('end', function (chunk) {
                var fs = require('fs');
                fs.writeFile("./public/proxyResuklt.pdf", Buffer.concat(data), function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                });

                var jsfile = new Buffer.concat(data);//.toString('base64');
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
