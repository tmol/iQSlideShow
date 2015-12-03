/*global angular, $*/
(function () {
    'use strict';
    angular.module('core').directive('ngSlideView', ["$timeout", "resolutions", "$injector", "JsInjector", "CssInjector", "$rootScope",
        function ($timeout, resolutions, $injector, JsInjector, CssInjector, $rootScope) {
            var template = '<div style="width:{{resolution.width}}px;height:{{resolution.height}}px;transform:{{transform}}">';
            template += "<div style='top: 50%; position: absolute; left: 50%;  transform: translate(-50%,-50%);zoom:{{zoomPercent}}%'>";
            template += "<div ng-include='templateUrl' class='ng-slide-view'></div>";
            template += "</div>";
            template += '</div>';
            return {
                scope: {
                    slideWidth: "=",
                    slideHeight: "=",
                    referenceSlide: "=",
                    isEdit: "="
                },
                template: template,
                link: function (scope, element, attrs) {


                    var update = function () {
                        if (!scope.referenceSlide) {
                            return;
                        }
                        scope.resolution = scope.referenceSlide.resolution || resolutions[0];
                        scope.zoomPercent = scope.referenceSlide.zoomPercent || 100;

                        var sx = element.parent().width() / scope.resolution.width;
                        var sy = element.parent().height() / scope.resolution.height;
                        var pad_x = ((scope.resolution.width * sx) - scope.resolution.width) / 2;
                        var pad_y = ((scope.resolution.height * sy) - scope.resolution.height) / 2;
                        var scale = Math.min(sx, sy);
                        scope.transform = "translate(" + pad_x + "px," + pad_y + "px) scale(" + scale + ")";
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                    };
                    var setup = function () {
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
                                update();
                            });
                        });
                    };

                    scope.$watch("referenceSlide", function (newValue, oldValue) {
                        if (newValue) {
                            setup();
                        }
                    });
                    scope.$watch("referenceSlide.resolution", function (newValue, oldValue) {
                        update();
                    });
                    scope.$watch("referenceSlide.zoomPercent", function (newValue, oldValue) {
                        update();
                    });

                    scope.$on("getSlideContentPart", function (event, contentPartName, callback) {
                        var content = scope.referenceSlide.content || {};
                        callback(content[contentPartName]);
                    });
                    scope.$on("getTemplatePath", function (event, callback) {
                        callback(scope.referencePath);
                    });

                    $(window).on("resize", update);

                    scope.$on("$destroy", function () {
                        $(window).off("resize", update);
                    });
                }
            };
        }]);
}());
