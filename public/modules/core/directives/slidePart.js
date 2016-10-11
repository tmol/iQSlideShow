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
                        if (element.attr('type') === 'script' && element.attr('url')) {
                            scope.$emit('getTemplatePath', injectScript);

                            return;
                        }

                        if (!content || /^\s+$/.test(content)) {
                            content = '';
                        }

                        if (content === oldContent) {
                            return;
                        }

                        oldContent = content;

                        switch (element.prop('tagName').toUpperCase()) {
                            case 'IMG':
                                element.attr('src', content || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEXMzMzKUkQnAAAACklEQVR4XmNgAAAAAgAB3p6PvwAAAABJRU5ErkJggg==');

                                break;

                            case 'A':
                                if (content) {
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
                                }

                                break;

                            default:
                                if (content) {
                                    var text = content;
                                    if (element.attr('encoded') === 'true') {
                                        eval('text="' + content + '"');
                                    }
                                    element.html(text);
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

                        scope.$emit('setTemplateElement', attrs.member, {
                            type: attrs.type || 'text',
                            label: attrs.label || attrs.member
                        });
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
