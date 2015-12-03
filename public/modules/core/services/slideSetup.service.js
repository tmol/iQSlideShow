/*global angular*/
(function () {
    'use strict';

    angular.module('core').factory('SlideSetup', ['$injector', 'JsInjector', 'CssInjector',
        function ($injector, JsInjector, CssInjector) {
            return {
                setup: function (scope) {
                    scope.templateUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.html';
                    scope.cssUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.css';
                    scope.jsUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.js';
                    scope.referencePath = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/';

                    //load the script for the referenceSlide
                    JsInjector.inject(scope.jsUrl, function (slideScript) {
                        //prepare the stylesheet for the slide and informe the subscribers that the slide was loaded
                        CssInjector.inject(scope.$parent, scope.cssUrl, function () {
                            if (slideScript) {
                                var newScope = scope.$new(true);
                                newScope.slide = scope.referenceSlide;
                                newScope.referencePath = scope.referencePath;
                                $injector.invoke(slideScript, newScope, {
                                    "$scope": newScope
                                });
                            }
                            scope.$emit("slideLoaded", scope.referenceSlide);
                        });
                    });
                }
            };
        }
        ]);
}());
