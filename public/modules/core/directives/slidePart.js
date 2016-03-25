/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slidePart', ['ScriptInjector',
        function (ScriptInjector) {
            return {
                link: function postLink(scope, element, attrs) {
                    if (scope.referenceSlide
                            && scope.referenceSlide.fireSetTemplateElementEvent
                            && element.attr("type") !== "script") {
                        scope.$emit("setTemplateElement", attrs.member, {
                            type: attrs.type || 'text',
                            label: attrs.label || attrs.member
                        });
                    }

                    var slide;
                    var templatePath;

                    var update = function (content) {
                        if (element.attr("type") === "script" && element.attr("url") && !scope.isEdit) {
                            scope.$emit("getTemplatePath", function (templatePath) {
                                ScriptInjector.inject(templatePath + element.attr("url"), element.attr("tag") || element.attr("url"));
                            });
                        }

                        if (element[0].tagName === "IMG") {
                            element[0].src = content || 'modules/slideshows/css/img/default.jpg';
                            return;
                        }
                        if (content) {
                            var text = content;
                            if (element.attr("encoded") === "true") {
                                eval("text='" + content + "'");
                            }
                            element.html(text);
                        }
                    };

                    var loadSlideContent = function () {
                        scope.$emit("getSlideContentPart", attrs.member, function (content) {
                            update(content);
                        });
                    };

                    loadSlideContent();

                    scope.$watch(function () {
                        loadSlideContent();
                    });
                }
            };
        }]);
}());
