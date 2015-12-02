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

    var searchForString = function (data, regEx, res, infoDescription) {
        var match = data.match(regEx);
        if (match.length !== 2) {
            console.log('Power point online: cannot find ' + regEx + ' in  ' + data);
            return res.status(400).send({
                message: 'The repsonse from power point online dows not contain the expected information.'
            });
        }

        console.log(infoDescription + ' ' + match[1]);
        return match[1];
    };

    var postForPowerPointViewFrame = function (viewFramePostData, res) {
        var postData = querystring.stringify({
            'ak' : viewFramePostData.ak,
            'mcttl' : viewFramePostData.mcttl,
            'mcsi' : viewFramePostData.mcsi,
            'mci' : viewFramePostData.mci
        });

        var postOptions = {
            host: 'powerpoint.officeapps.live.com',
            port: '443',
            path:  viewFramePostData.viewUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        var postReq = https.request(postOptions, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
            res.on('error', function (exception) {
                handleException("getting presentation details2", exception, res);
            });
            res.on('end', function (chunk) {
                console.log('Response: ' + chunk);
                res.jsonp(viewFramePostData);
            });
        });

        // post the data
        postReq.write(postData);
        postReq.end();

        return viewFramePostData;
    };

    exports.getPresentationDetails = function (req, res) {
        https.get(req.params.pptUrl, function (result) {
            var data = '',
                viewFramePostData = {},
                viewFramePostDataResult;

            result.on('data', function (chunk) {
                data = data + chunk;
            });

            result.on('end', function (chunk) {
                try {
                    viewFramePostData.viewUrl = searchForString(data, /formElement\.setAttribute\('action', '(.*)\'\);/, res, 'viewUrl');
                    viewFramePostData.mcttl = searchForString(data, /fields\["mcttl"\]\.setAttribute\("value", "(.*)"\);/, res, 'mcttl');
                    viewFramePostData.ak = searchForString(data, /fields\["ak"\]\.setAttribute\("value", "(.*)"\);/, res, 'ak');
                    viewFramePostData.mcsi = searchForString(data, /fields\["mcsi"\]\.setAttribute\("value", "(.*)"\);/, res, 'mcsi');
                    viewFramePostData.mci = searchForString(data, /fields\["mci"\]\.setAttribute\("value", "(.*)"\);/, res, 'mci');

                    viewFramePostDataResult = postForPowerPointViewFrame(viewFramePostData, res);
                } catch (exception) {
                    handleException("getting presentation details2", exception, res);
                }
            });
        }).on('error', function (e) {
            handleException("getting presentation details", e, res);
        });
    };

    exports.getPdf = function (req, res) {
        var pdfUrl = req.params.pdfUrl;

        var postOptions = {
            host: 'powerpoint.officeapps.live.com',
            path:  pdfUrl,
            method: 'GET',
            headers: {
				'Accept-Encoding': 'gzip, deflate, sdch',
				'Accept': '*/*'
            }
        };
        https.get(postOptions, function (result) {
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
