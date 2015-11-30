/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slidePart', [
        function () {
            return {
                link: function postLink(scope, element, attrs) {

                    scope.$emit("setTemplateElement", attrs.member, {
                        type: attrs.type || 'text',
                        label: attrs.label || attrs.member
                    });

                    var content;
                    scope.$emit("getSlide", function (slide) {
                        content = slide.content;
                    });

                    scope.$watch(function () {
                        if (!content) {
                            return;
                        }

                        if (element[0].tagName === "IMG") {
                            element[0].src = content[attrs.member] || 'modules/slideshows/css/img/default.jpg';
                            return;
                        }
                        if (content[attrs.member]) {
                            element[0].innerHTML = content[attrs.member];
                        } else {
                            element[0].innerHTML = "";
                        }
                    });
                }
            };
        }
    ]);
}());
