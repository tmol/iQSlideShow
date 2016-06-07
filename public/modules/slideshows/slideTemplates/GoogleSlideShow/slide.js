/*global PDFJS*/
function GoogleSlideShowScript($scope, $http) {
    'use strict';

    $scope.topMargin = '0px';
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
            var slide = $scope.referenceSlide || {};

            if (!slide.content || slide.content.isExpanded) {
                callback(null);
                return;
            }

            loadSlides(slide.content.slideShowId, function (googleSlides) {
                callback(googleSlides);
            }, function (error) {
                callback(null);
            });
        }
    };
}
