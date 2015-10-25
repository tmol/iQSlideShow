/*global angular*/
(function() {
    'use strict';
    angular.module('core').directive('ngSlideView', ["$timeout",
        function($timeout) {

            return {
                scope: {
                    slideWidth: "=",
                    slideHeight: "="
                },
                link: function postLink(scope, element, attrs) {
                    var zoom = 100;
                    if (!scope.slideWidth) {
                        scope.slideWidth = 960;
                        scope.slideHeight = 540;
                    }
                    $(element[0]).width(scope.slideWidth);
                    $(element[0]).height(scope.slideHeight);
                    var timeout = null;
                    var resize = function() {
                        $timeout.cancel(timeout);
                        timeout = $timeout(function() {

                            var sx = $(element).parent().width() * 100 / scope.slideWidth;
                            var sy = $(element).parent().height() * 100 / scope.slideHeight;
                            zoom = Math.min(sx, sy);

                            element.css("zoom", zoom + "%");
                        }, 100);
                    }

                    resize();
                    $(window).on("resize", resize);
                    scope.$on("$destroy", function() {
                        $(window).off("resize", resize);
                    });
                }
            };
        }
    ]);
}());
