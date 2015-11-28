/*global angular, $*/
(function () {
    'use strict';
    angular.module('core').directive('ngSlideView', ["$timeout", "resolutions",
        function ($timeout, resolutions) {
            var template = '<div style="width:{{referenceSlide.resolution.width}}px;height:{{referenceSlide.resolution.height}}px;transform:{{transform}}">';
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
                            var sx = element.parent().width() / scope.referenceSlide.resolution.width;
                            var sy = element.parent().height() / scope.referenceSlide.resolution.height;
                            var pad_x = ((scope.referenceSlide.resolution.width * sx) - scope.referenceSlide.resolution.width) / 2;
                            var pad_y = ((scope.referenceSlide.resolution.height * sy) - scope.referenceSlide.resolution.height) / 2;
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
