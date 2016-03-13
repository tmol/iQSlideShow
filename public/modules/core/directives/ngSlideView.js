/*global angular, $*/
(function () {
    'use strict';
    angular.module('core').directive('ngSlideView', ['$timeout', 'resolutions', '$rootScope', 'SlideSetup',
        function ($timeout, resolutions, $rootScope, SlideSetup) {
            var template = '<div style="width:{{resolution.width}}px;height:{{resolution.height}}px;transform:{{transform}}" touch-start="onSlideClicked($event)">';
            template += "<svg style='width:0px;height:0px;opacity:0.8;position: absolute;margin-left:{{indicatorLeft}}px;margin-top:{{indicatorTop}}px;display:block;z-index:1000; transform: translate(-50%,-50%)' ng-show='indicatorVisible'><circle cx='50%' cy='50%' r='46%' stroke='red' fill='red' fill-opacity='0.0' stroke-width='4%'></circle></svg>";
            template += "<div style='top: 50%; position: absolute; left: 50%;  transform: translate(-50%,-50%);zoom:{{zoomPercent}}%'>";
            template += "<div ng-class=\"{'iqss-hidden':!slideLoaded}\" ng-include='templateUrl' onload='templateLoaded()' class='ng-slide-view'></div>";
            template += "<div ng-show='!slideLoaded' style='top: 50%; position: absolute; left: 50%;  transform: translate(-50%,-50%);z-index:100' >LOADING...</div>";
            template += "</div>";
            template += '</div>';
            return {
                scope: {
                    slideWidth: "=",
                    slideHeight: "=",
                    referenceSlide: "=",
                    isPlaying: "="
                },
                template: template,
                link: function (scope, element, attrs) {
                    var templateLoaded = false;
                    scope.loadedScripts = [];
                    scope.slideLoaded = false;
                    scope.indicatorVisible = false;
                    scope.indicatorSize = 0;
                    var positionScale = {sx : 0, sy : 0, scale: 0};
                    var applyUpdate = function () {
                        if (!scope.referenceSlide) {
                            return;
                        }
                        scope.resolution = scope.referenceSlide.resolution || resolutions[0];
                        scope.zoomPercent = scope.referenceSlide.zoomPercent || 100;

                        positionScale.sx = element.parent().width() / scope.resolution.width;
                        positionScale.sy = element.parent().height() / scope.resolution.height;
                        var pad_x = ((scope.resolution.width * positionScale.sx) - scope.resolution.width) / 2;
                        var pad_y = ((scope.resolution.height * positionScale.sy) - scope.resolution.height) / 2;
                        positionScale.scale = Math.min(positionScale.sx, positionScale.sy);
                        scope.indicatorSize = Math.max(scope.resolution.width, scope.resolution.height)*10/100;
                        scope.transform = "translate(" + pad_x + "px," + pad_y + "px) scale(" + positionScale.scale + ")";
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }

                        scope.$emit("slideLoaded", scope.referenceSlide);
                    };

                    var lastTimeout;
                    var update = function () {
                        $timeout.cancel(lastTimeout);
                        if (scope.slideConfiguration && scope.slideConfiguration.onUpdate) {
                            scope.slideConfiguration.onUpdate(function () {
                                lastTimeout = $timeout(applyUpdate, 10);
                            });
                            return;
                        }

                        lastTimeout = $timeout(applyUpdate, 10);

                    };
                    scope.onSlideClicked = function (event) {
                        var pageX = 0;
                        var pageY = 0;
                        if (event.originalEvent.touches && event.originalEvent.touches.length > 0) {
                            pageX = event.originalEvent.touches[0].pageX;
                            pageY = event.originalEvent.touches[0].pageY;
                        } else {
                            pageX = event.originalEvent.pageX;
                            pageY = event.originalEvent.pageY;
                        }
                        var target = $(event.currentTarget);

                        var x = pageX - target.offset().left;
                        var y = pageY - target.offset().top;


                        var percentX = x * 100 / (scope.resolution.width*positionScale.scale);
                        var percentY = y * 100 / (scope.resolution.height*positionScale.scale);


                        $rootScope.$broadcast("slideShowClicked", {percentX : percentX, percentY : percentY});
                    }
                    scope.$watch("referenceSlide", function (newValue, oldValue) {
                        if (newValue) {
                            SlideSetup.setup(scope, element);
                        }
                    });
                    scope.$watch("referenceSlide.resolution", function (newValue, oldValue) {
                        if (!scope.isPlaying) {
                            update();
                        }
                    });
                    scope.$watch("referenceSlide.zoomPercent", function (newValue, oldValue) {
                        if (!scope.isPlaying) {
                            update();
                        }
                    });

                    scope.$on("getSlideContentPart", function (event, contentPartName, callback) {
                        var content = scope.referenceSlide.content || {};
                        callback(content[contentPartName]);
                    });
                    scope.$on("getTemplatePath", function (event, callback) {
                        callback(scope.referencePath);
                    });
                    scope.$on("displayIndicator", function (event, position) {
                        scope.indicatorLeft = (scope.resolution.width * position.percentX)/100;
                        scope.indicatorTop = (scope.resolution.height * position.percentY)/100;
                        scope.indicatorVisible = true;
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                        element.find('svg').animate({width:scope.indicatorSize+"px", height:scope.indicatorSize+"px"},1000, "easeInOutElastic");

                    });
                    scope.$on("hideIndicator", function (event, position) {
                        element.find('svg').animate({width:"0px", height:"0px"},1000, "easeInOutElastic", function () {
                            scope.indicatorVisible = false;
                            if (!$rootScope.$$phase) {
                                $rootScope.$apply();
                            }
                        });

                    });

                    // TODO update only once per resize
                    $(window).on("resize", update);

                    scope.$on("scriptLoaded", function (event, scriptUrl) {
                        scope.loadedScripts.push(scriptUrl);
                    });

                    scope.$on("$destroy", function () {
                        $(window).off("resize", update);
                    });

                    scope.templateLoaded = function () {
                        templateLoaded = true;
                        scope.slideLoaded = true;
                        SlideSetup.loadScripts(scope, element).then(function () {
                            if (scope.referenceSlide.setupFinishedPromise) {
                                scope.referenceSlide.setupFinishedPromise.resolve();
                            }

                            update();
                        });
                    };
                }
            };
        }
    ]);
}());
