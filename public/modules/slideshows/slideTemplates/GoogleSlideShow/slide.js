/*global PDFJS*/
function GoogleSlideShowScript($scope, $http) {
    'use strict';

    var loadSlides = function (slideShowId, onSuccess, onError) {
        $http({
            url: "/proxy",
            method: "POST",
            data: {
                hostname: "docs.google.com",
                method: "GET",
                protocol: "https:",
                path: "/presentation/d/" + slideShowId + "/pub"
            }
        }).success(function (body) {
            try {
                var regex = /(\\x3csvg version)(?:[^])*?(\\x3c\\\/svg)/g;
                var result = body.match(regex);
                result = result.map(function (item, i) {
                    var escapedSlide = null;
                    eval("escapedSlide='" + item + "';");
                    return {
                        content: escapedSlide,
                        isExpanded: true
                    };
                });
                onSuccess(result);
            } catch (e) {
                console.log(e);
                onError(e);
            }
        }).error(function (e) {
            onError(e);
        });
    };
    return {
        expand: function (callback) {
            if ($scope.slide.content.isExpanded) {
                callback(null);
                return;
            }
            loadSlides($scope.slide.content.slideShowId, function (googleSlides) {
                callback(googleSlides);
            }, function (error) {
                callback(null);
            });
        }
    };
}