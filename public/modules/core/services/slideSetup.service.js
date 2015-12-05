/*jslint nomen: true, vars: true*/
/*global _, angular*/
(function () {
    'use strict';

    angular.module('core').factory('SlideSetup', ['$injector', 'JsInjector', 'CssInjector', '$q',
        function ($injector, JsInjector, CssInjector, $q) {

            var expand = function (slide, expandFunction) {
                var deferred = $q.defer();

                expandFunction(function (expandedSlidesContents) {
                    if (!expandedSlidesContents) {
                        deferred.resolve();
                        return;
                    }
                    var expandedSlides = [];

                    expandedSlidesContents.forEach(function (expandedContent) {
                        var newslide = JSON.parse(JSON.stringify(slide));
                        delete newslide.setupFinishedPromise;
                        newslide.content = _.merge(newslide.content, expandedContent);
                        expandedSlides.push(newslide);
                    });
                    slide.expandedSlides = expandedSlides;
                    deferred.resolve();
                });

                return deferred.promise;
            };

            var resolveSetupPromise = function (scope, deferred) {
                deferred.resolve();
            };

            return {
                setup: function (scope) {
                    scope.templateUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.html';
                    scope.cssUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.css';
                    scope.jsUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.js';
                    scope.referencePath = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/';

                    var deferred = $q.defer();

                    JsInjector.inject(scope.jsUrl, function (slideScript) {
                        //prepare the stylesheet for the slide and informe the subscribers that the slide was loaded
                        CssInjector.inject(scope.$parent, scope.cssUrl, function () {

                            if (!slideScript) {
                                resolveSetupPromise(scope, deferred);
                                return;
                            }

                            var newScope = scope.$new(true);
                            newScope.slide = scope.referenceSlide;
                            newScope.referencePath = scope.referencePath;
                            scope.slideConfiguration = $injector.invoke(slideScript, newScope, {
                                "$scope": newScope
                            }) || {};

                            if (!scope.isPlaying || !scope.slideConfiguration.expand) {
                                resolveSetupPromise(scope, deferred);
                                return;
                            }

                            expand(newScope.slide, scope.slideConfiguration.expand).then(function (successResult) {
                                resolveSetupPromise(scope, deferred);
                            }, function (errResult) {
                                resolveSetupPromise(scope, deferred);
                            });
                        });
                    });

                    return deferred.promise;
                }
            };
        }
        ]);
}());