/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slidePart', ['ScriptInjector',
        function (ScriptInjector) {
            return {
                link: function postLink(scope, element, attrs) {
                    if (element.attr("type") !== "script") {
                        scope.$emit("setTemplateElement", attrs.member, {
                            type: attrs.type || 'text',
                            label: attrs.label || attrs.member
                        });
                    }

                    var slide;
                    var templatePath;
                    var update = function () {
                        if (!slide) {
                            return;
                        }

                        if (element.attr("type") === "script" && element.attr("url") && scope.isEdit) {
                            ScriptInjector.inject(templatePath + element.attr("url"));
                        }
                        if (!slide.content) {
                            return;
                        }
                        var content = slide.content;
                        if (element[0].tagName === "IMG") {
                            element[0].src = content[attrs.member] || 'modules/slideshows/css/img/default.jpg';
                            return;
                        }
                        if (content[attrs.member]) {
                            var text = content[attrs.member];
                            if (element.attr("encoded") === "true") {
                                eval("text='" + content[attrs.member] + "'");
                            }
                            element.html(text);
                        }
                    };
                    scope.$emit("getSlide", function (referenceSlide, referencePath) {
                        slide = referenceSlide;
                        templatePath = referencePath;
                        update();
                    });

                    scope.$watch(function () {
                        update();
                    });
                    scope.$on("$destroy", function () {
                        slide = null;
                    });
                }
            };
        }]);
}());
