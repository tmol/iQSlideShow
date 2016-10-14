/*global angular*/

(function() {
    'use strict';

    angular.module('core').directive('slidePart', ['ScriptInjector',
        function(ScriptInjector) {
            return {
                require: '?^^slideSection',
                link: function postLink(scope, element, attrs, section) {
                    var oldContent;

                    var injectScript = function(templatePath) {
                        ScriptInjector.inject(templatePath + element.attr('url'), element.attr('tag') || element.attr('url'));
                    };

                    var update = function(content) {
                        var showPlaceholder;

                        if (element.attr('type') === 'script' && element.attr('url')) {
                            scope.$emit('getTemplatePath', injectScript);

                            return;
                        }

                        if (!content || /^\s+$/.test(content)) {
                            content = '';

                            showPlaceholder = !oldContent;
                        } else {
                            showPlaceholder = false;
                        }

                        if (content === oldContent) {
                            return;
                        }

                        oldContent = content;

                        if (showPlaceholder) {
                            content = attrs.placeholder;
                        }

                        switch (element.prop('tagName').toUpperCase()) {
                            case 'IMG':
                                element.attr('src', content || attrs.placeholder);

                                break;

                            case 'A':
                                if (content) {
                                    element.show();

                                    var href = content;
                                    var httpRegex = /^https?:\/\//;

                                    // Checking for @ is fine for our purposes; there is no point in validating the email address.
                                        if (content.indexOf('@') !== -1) {
                                            href = 'mailto:' + content;
                                        } else if (!httpRegex.test(content)) {
                                            href = 'http://' + content;
                                        }

                                    element.attr('href', href);
                                    element.text(content.replace(httpRegex, ''));
                                } else {
                                    element.hide();
                                }

                                break;

                            default:
                                if (content) {
                                    element.show();

                                    var text = content;

                                    if (element.attr('encoded') === 'true') {
                                        eval("text='" + content + "'");
                                    }

                                    if (attrs.type === 'html') {
                                        element.html(text);
                                    } else {
                                        element.text(text);
                                    }
                                } else {
                                    element.hide();
                                }

                                break;
                        }

                        scope.$broadcast('slidePartUpdated', content, attrs.member);
                    };

                    if (section) {
                        section.addMember(attrs.member);
                    }

                    if (scope.slide &&
                        scope.slide.fireSetTemplateElementEvent &&
                        element.attr('type') !== 'script' &&
                        element.attr('hiddenPart') !== 'true') {

                        var info = {
                            type: attrs.type || 'text',
                            label: attrs.label || attrs.member,
                            value: attrs.placeholder
                        };

                        scope.$emit('setTemplateElement', attrs.member, info, scope.slide);
                    }

                    scope.$watch('slide.content.' + attrs.member, update);
                },
                controller: function SlidePartController () {
                    // nothing to do, used for directives that depend on slide-part
                }
            };
        }
    ]);
}());
