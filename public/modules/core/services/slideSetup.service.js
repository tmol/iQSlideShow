/*jslint nomen: true, vars: true*/
/*global _, angular*/
(function () {
    'use strict';

    angular.module('core').factory('SlideSetup', ['$injector', 'JsInjector', 'CssInjector', '$q',
        function ($injector, JsInjector, CssInjector, $q) {

            var expand = function (slide, element, expandFunction) {
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
                        newslide.content = _.extend(newslide.content, expandedContent);
                        expandedSlides.push(newslide);
                    });
                    slide.expandedSlides = expandedSlides;
                    deferred.resolve();
                }, element);

                return deferred.promise;
            };

            var resolveSetupPromise = function (scope, deferred) {
                deferred.resolve();
            };

            return {
                setup: function (scope, element) {
                    if (scope.referenceSlide) {
                        scope.templateUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.html?version=' + Date();
                        scope.cssUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.css?version=' + Date();
                        scope.jsUrl = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/slide.js?version=' + Date();
                        scope.referencePath = 'modules/slideshows/slideTemplates/' + (scope.referenceSlide.templateName || 'default') + '/';
                    } else {
                        scope.templateUrl = 'modules/slideshows/slideTemplates/default/slide.html?version=' + Date();
                    }
                },
                loadScripts: function (scope, element) {
                    var deferred = $q.defer();

                    JsInjector.inject(scope.jsUrl, function (slideScript) {
                        //prepare the stylesheet for the slide and informe the subscribers that the slide was loaded
                        CssInjector.inject(scope.$parent, scope.cssUrl, function () {

                            if (!slideScript) {
                                resolveSetupPromise(scope, deferred);
                                return;
                            }

                            scope.slideConfiguration = $injector.invoke(slideScript, scope, {
                                "$scope": scope
                            }) || {};

                            if (!scope.isPlaying && scope.slideConfiguration.preview) {
                                scope.slideConfiguration.preview(function () {
                                    resolveSetupPromise(scope, deferred);
                                    return;
                                }, element);
                            }

                            if (!scope.isPlaying || !scope.slideConfiguration.expand) {
                                resolveSetupPromise(scope, deferred);
                                return;
                            }

                            expand(scope.referenceSlide, element, scope.slideConfiguration.expand).then(function (successResult) {
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
