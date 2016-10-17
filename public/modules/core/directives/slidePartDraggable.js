/*global angular*/

(function() {
    'use strict';

    angular.module('core').directive('slidePartDraggable', ['$document',
        function($document) {
            return {
                require: 'slidePart',

                link: function postLink(scope, element, attrs) {
                    var minOffset = parseFloat(attrs.draggableMinOffset);
                    var maxOffset = parseFloat(attrs.draggableMaxOffset);

                    if (!scope.slide.content) {
                        scope.slide.content = {};
                    }

                    if (!scope.slide.content[attrs.draggableMember]) {
                        scope.slide.content[attrs.draggableMember] = maxOffset;
                    }

                    var container = element.parents('.ng-slide-view');

                    var active  = false;
                    var enabled = false;

                    var startX = 0;
                    var lastX  = scope.slide.content[attrs.draggableMember];

                    var mousemove = function(event) {
                        if (active) {
                            lastX = startX - event.pageX;

                            var minOffsetComputed = Math.abs(minOffset) - element[0].width;

                            if (lastX < minOffsetComputed) {
                                lastX = minOffsetComputed;
                            }

                            if (lastX > maxOffset) {
                                lastX = maxOffset;
                            }

                            element.css('right', lastX + 'px');
                            scope.slide.content[attrs.draggableMember] = lastX;
                        }
                    };

                    var mouseup = function() {
                        active = false;
                    };

                    var mousedown = function(event) {
                        event.preventDefault();

                        if (enabled) {
                            active = true;
                            startX = event.pageX + lastX;
                        }
                    };

                    if (scope.slide.isEdit) {
                        container.on('mousedown', mousedown);
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);

                        scope.$watch('slide.content.' + attrs.member, function(picture) {
                            enabled = !!picture;
                        });

                        scope.$watch('slide.content.' + attrs.draggableMember, function(offset) {
                            element.css('right', offset + 'px');
                        });

                        scope.$on('$destroy', function() {
                            container.off('mousedown', mousedown);
                            $document.off('mousemove', mousemove);
                            $document.off('mouseup', mouseup);
                        });
                    }
                }
            };
        }
    ]);
}());
