/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slidePart', ['ScriptInjector',
        function (ScriptInjector) {
            return {
                link: function postLink(scope, element, attrs) {
                    if (scope.referenceSlide
                            && scope.referenceSlide.fireSetTemplateElementEvent
                            && element.attr("type") !== "script"
                            && element.attr("hiddenPart") !== "true") {
                        scope.$emit("setTemplateElement", attrs.member, {
                            type: attrs.type || 'text',
                            label: attrs.label || attrs.member
                        });
                    }

                    var slide;
                    var templatePath;
                    var oldContent;
                    var update = function (content) {
                        if (element.attr("type") === "script" && element.attr("url") && !scope.isEdit) {
                            scope.$emit("getTemplatePath", function (templatePath) {
                                ScriptInjector.inject(templatePath + element.attr("url"), element.attr("tag") || element.attr("url"));
                                return;
                            });
                        }

                        if (oldContent === content) {
                            return;
                        }
                        oldContent = content;

                        if (element[0].tagName === "IMG") {
                            element[0].src = content || 'modules/slideshows/css/img/default.jpg';
                            return;
                        }

                        if (element[0].tagName === "A") {
                            var url = content || "";

                            if (url && !/^https?:\/\//.test(url)) {
                                url = 'http://' + url;
                            }

                            element[0].href = url;
                            element[0].textContent = url.replace(/^https?:\/\//, "");

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
                    scope.$on("updateSlideContentPart", function (event, content, member, slidePartId) {
                        if (slidePartId !== scope.$id || member !== attrs.member) {
                            return;
                        }
                        update(content);
                    });
                    var loadSlideContent = function () {
                        scope.$emit("getSlideContentPart", attrs.member, function (content) {
                            update(content);
                        });
                    };

                    loadSlideContent();
                }
            };
        }]);
}());
