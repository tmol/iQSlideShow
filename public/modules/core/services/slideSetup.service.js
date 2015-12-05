/*jslint nomen: true, vars: true*/
/*global _, angular*/
(function () {
    'use strict';

    angular.module('core').factory('SlideSetup', ['$injector', 'JsInjector', 'CssInjector', '$q',
        function ($injector, JsInjector, CssInjector, $q) {

            var expand = function (slide, expandFunction) {
                var deferred = $q.defer();

                expandFunction(function (expandedSlidesContents) {

                    var expandedSlides = [];

                    expandedSlidesContents.forEach(function (expandedContent) {
                        var newslide = {
                            slideNumber : 0,
                            "slideShowId" : slide.slideShowId,
                            "resolution" : _.extend({}, slide.resolution),
                            "hidden" : slide.hidden,
                            "content" : _.merge(expandedContent, slide.content),
                            "detailsUrl" : slide.detailsUrl,
                            "animationType" : slide.animationType,
                            "zoomPercent" : slide.zoomPercent,
                            "durationInSeconds" : slide.durationInSeconds,
                            "templateName" : slide.templateName
                        };

                        expandedSlides.push(newslide);
                    });

                    slide.expandedSlides = expandedSlides;
                    deferred.resolve();
                });

                return deferred.promise;
            };

            var resolveSetupPromise = function (scope, deferred) {
                deferred.resolve();
                scope.$emit("slideLoaded", scope.referenceSlide);
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
                            scope.slideConfiguration = {};
                            if (slideScript) {
                                var newScope = scope.$new(true);
                                newScope.slide = scope.referenceSlide;
                                newScope.referencePath = scope.referencePath;
                                scope.slideConfiguration = $injector.invoke(slideScript, newScope, {
                                    "$scope": newScope
                                }) || {};

                                if (scope.isPlaying) {
                                    if (scope.slideConfiguration.expand) {
                                        expand(newScope.slide, scope.slideConfiguration.expand).then(function (successResult) {
                                            resolveSetupPromise(scope, deferred);
                                        }, function (errResult) {
                                            resolveSetupPromise(scope, deferred);
                                        });
                                    } else {
                                        resolveSetupPromise(scope, deferred);
                                    }
                                }
                            } else {
                                resolveSetupPromise(scope, deferred);
                            }
                        });
                    });

                    return deferred.promise;
                }
            };
        }
        ]);
}());
