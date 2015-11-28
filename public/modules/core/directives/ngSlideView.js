/*global angular, $*/
(function () {
    'use strict';
    angular.module('core').directive('ngSlideView', ["$timeout", "resolutions",
        function ($timeout, resolutions) {
            var template = '<div style="width:{{resolution.width}}px;height:{{resolution.height}}px;transform:{{transform}}">';
            template += "<div style='top: 50%; position: absolute; left: 50%;  transform: translate(-50%,-50%);zoom:{{referenceSlide.zoomPercent}}%'>";
            template += "<div ng-include='referenceSlide.templateUrl' class='ng-slide-view'></div>";
            template += "</div>";
            template += '</div>';
            return {
                scope: {
                    slideWidth: "=",
                    slideHeight: "=",
                    referenceSlide: "="
                },
                template: template,
                link: function (scope, element, attrs) {
                    var update = function () {

                            if (!scope.referenceSlide) {
                                return;
                            }
                            scope.resolution = scope.referenceSlide.resolution;
                            if (!scope.resolution) {
                                scope.resolution = resolutions[0];
                            }
                            var sx = element.parent().width() / scope.resolution.width;
                            var sy = element.parent().height() / scope.resolution.height;
                            var pad_x = ((scope.resolution.width * sx) - scope.resolution.width) / 2;
                            var pad_y = ((scope.resolution.height * sy) - scope.resolution.height) / 2;
                            var scale = Math.min(sx, sy);
                            scope.transform = "translate(" + pad_x + "px," + pad_y + "px) scale(" + scale + ")";

                    };
                    scope.$watch("referenceSlide", function () {
                        update();
                    });
                    scope.$watch("referenceSlide.resolution", function () {
                        update();
                    });

                    scope.$on("getSlide", function (event, callback) {
                        callback(scope.referenceSlide);
                    });

                    scope.getSlide = function () {
                        return scope.referenceSlide;
                    };
                    $(window).on("resize", update);
                    scope.$on("$destroy", function () {
                        $(window).off("resize", update);
                    });
                    update();
                }
            };
        }]);
}());
