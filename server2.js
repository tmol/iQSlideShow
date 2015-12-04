/*global require, exports, mongoose*/
/*jslint regexp: true*/
(function () {
    'use strict';

    var http = require('http'),
		https = require('https'),
		longjohn = require('longjohn'),
		querystring = require('querystring'),
		cookies = [];

	longjohn.async_trace_limit = -1

    var handleException = function (context, exception) {
        var message = exception.message || exception;
        console.log("Got error during " + context + " : " + message);
    };

    var searchForString = function (data, regEx, infoDescription) {
        var match = data.match(regEx);
        if (match.length !== 2) {
            console.log('Power point online: cannot find ' + regEx + ' in  ' + data);
			return;
        }

        return match[1];
    };

	var saveCookies = function(incomingMessage) {
		var cookie,
			cookieInIncomingMsg,
			cookiesInIncomingMsg = incomingMessage.headers["set-cookie"];
		for (var idx = 0; idx <  cookiesInIncomingMsg.length; idx = idx + 1) {
			cookieInIncomingMsg = cookiesInIncomingMsg[idx];
			cookie = {};
			cookie.name = searchForString(cookieInIncomingMsg, /([^=]*)/, 'cookie name');
			cookie.value = searchForString(cookieInIncomingMsg, /=(.*?);/, 'cookie value');
			cookies.push(cookie);
		}
	}

	var getARRAffinityCookie = function(callback) {
       var postOptions = {
            host: 'powerpoint.officeapps.live.com',
            path:  '/p/RemoteUls.ashx?build=16.0.6228.1013&waccluster=DB3B',
            method: 'POST',
            headers: {
				'Content-Length': 0,
				'X-BrowserUlsBeacon': '[{"Index":5,"MsSinceStart":1820185,"Value":"SessionExited","Type":"SessionBoundary"}]'
            }
        };

        var postReq = https.request(postOptions, function (res) {
			saveCookies(res);
			console.log('\r\ngetARRAffinityCookie START');

			res.on('data', function (chunk) {
            });
            res.on('error', function (exception) {
                handleException("getting presentation details2", exception, res);
            });
			res.on('end', function (chunk) {
                callback();
            });
        }).on('error', function(e) {
			console.log(e.code);
			console.log(e.errno);
			console.log(e.syscall);
		});

        postReq.end();
	}

    var postForPowerPointViewFrame = function (viewFramePostData) {
        var postData = querystring.stringify({
            'ak' : viewFramePostData.ak,
            'mcttl' : viewFramePostData.mcttl,
            'mcsi' : viewFramePostData.mcsi,
            'mci' : viewFramePostData.mci
        });

		var cookiesHeader = '',
			cookie;
		for (var idx = 0; idx < cookies.length; idx = idx + 1) {
			cookie = cookies[idx];
			if (idx !== 0) {
				cookiesHeader += ';';
			}
			cookiesHeader = cookiesHeader + cookie.name + '=' + cookie.value + ' '
		}

		console.log('\r\ncookiesHeader: ' + cookiesHeader);
		console.log('\r\postData: ' + postData);
        var postOptions = {
            host: 'onedrive.live.com',
            path:  viewFramePostData.viewUrl,
            method: 'POST',
            headers: {
				'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Encoding':'gzip, deflate',
				'Accept-Language':'en-US,en;q=0.8',
				'Cache-Control':'no-cache',
				'Connection':'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
				'Origin':'https://onedrive.live.com',
				'Pragma':'no-cache',
				'Upgrade-Insecure-Requests':1,
				'User-Agent':'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
				'Cookie': cookiesHeader
            }
        };

        var postReq = https.request(postOptions, function (res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			console.log('COOKIES: ' + JSON.stringify(res.headers["set-cookie"]));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                //console.log('Response: ' + chunk);
            });
            res.on('error', function (exception) {
                handleException("getting presentation details2", exception, res);
            });
            res.on('end', function (chunk) {
                console.log('Response: ' + chunk);
            });
        }).on('error', function(e) {
			for (var prop in e) {
				console.log(prop);
			}
			console.log(e.code);
			console.log(e.errno);
			console.log(e.syscall);
		});

        // post the data
        postReq.write(postData);
        postReq.end();

        return viewFramePostData;
    };

	var replaceAll = function (str, find, replace) {
		return str.replace(new RegExp(find, 'g'), replace);
	}

    var getPresentationDetails = function () {
        https.get('https://onedrive.live.com/view.aspx?resid=DB7094EA6758EB62!3692&ithint=file%2cpptx&app=PowerPoint&authkey=!ALY2elfLlvdf8E0', function (result) {
            var data = '',
                viewFramePostData = {},
                viewFramePostDataResult;

			saveCookies(result);

            result.on('data', function (chunk) {
                data = data + chunk;
            });

			result.on('response', function(incomingMessage) {
				console.log('incomingMessage.headers: ' + incomingMessage);
			});

            result.on('end', function (chunk) {
				//console.log(data);
                try {
                    viewFramePostData.viewUrl = searchForString(data, /formElement\.setAttribute\('action', '(.*)\'\);/, 'viewUrl');
					viewFramePostData.viewUrl = viewFramePostData.viewUrl.substring(47);
					viewFramePostData.viewUrl = viewFramePostData.viewUrl.replace(/\\x2f/gi, '/').replace(/\\x3f/gi, '?').replace(/\\x3d/gi, '=').replace(/\\x26/gi, '&').replace(/\\x21/gi, '!').replace(/\\x25/gi, '%');
                    viewFramePostData.mcttl = searchForString(data, /fields\["mcttl"\]\.setAttribute\("value", "(.*)"\);/, 'mcttl');
                    viewFramePostData.ak = searchForString(data, /fields\["ak"\]\.setAttribute\("value", "(.*)"\);/, 'ak');
                    viewFramePostData.mcsi = searchForString(data, /fields\["mcsi"\]\.setAttribute\("value", "(.*)"\);/, 'mcsi');
                    viewFramePostData.mci = searchForString(data, /fields\["mci"\]\.setAttribute\("value", "(.*)"\);/, 'mci');

					console.log('viewFramePostData.viewUrl = ' + viewFramePostData.viewUrl);
					getARRAffinityCookie(function() {
						viewFramePostDataResult = postForPowerPointViewFrame(viewFramePostData);
					});
                } catch (exception) {
                    handleException("getting presentation details2", exception);
                }
            });
        }).on('error', function (e) {
            handleException("getting presentation details", e);
        });
    };

	getPresentationDetails();
}());
