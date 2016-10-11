/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slidePartDraggable', ['$document',
        function ($document) {

            return {
                link: function postLink(scope, element, attrs) {
                    var leftLimit = parseFloat(attrs.draggableLeftLimit);
                    var rightLimit = parseFloat(attrs.draggableRightLimit);
                    
                    if (!scope.slide.content) {
                        scope.slide.content = {};
                    }
                    
                    if (!scope.slide.content[attrs.draggableMember]) {
                        scope.slide.content[attrs.draggableMember] = rightLimit;
                    }

                    var container = element.parents(".ng-slide-view");

                    var active = false;
                    var enabled = false;

                    var startX = 0;
                    var lastX  = scope.slide.content[attrs.draggableMember];

                    var mousemove = function (event) {
                        if (active) {
                            lastX = event.pageX - startX;

                            if (lastX < rightLimit) {
                                lastX = rightLimit;
                            }

                            if (lastX > (element[0].width - leftLimit)) {
                                lastX = element[0].width - leftLimit;
                            }

                            element.css("left", lastX + "px");
                            scope.slide.content[attrs.draggableMember] = lastX;
                        }
                    }

                    var mouseup = function () {
                        active = false;
                    }

                    var mousedown = function (event) {
                        event.preventDefault();

                        if (enabled) {
                            active = true;
                            startX = event.pageX - lastX;
                        }
                    };

                    if (scope.slide.isEdit) {
                        container.on("mousedown", mousedown);
                        $document.on("mousemove", mousemove);
                        $document.on("mouseup", mouseup);
                        
                        scope.$watch("slide.content." + attrs.member, function (picture) {
                            enabled = !!picture;
                        });

                        scope.$watch("slide.content." + attrs.draggableMember, function (offset) {
                            element.css("left", offset + "px");
                        });
                    }
                }
            };
        }
    ]);
}());
