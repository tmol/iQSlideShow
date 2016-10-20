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
                    var direction = attrs.draggableDirection || 'horizontal';

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
                    var startY = 0;
                    var lastX  = scope.slide.content[attrs.draggableMember];
                    var lastY  = scope.slide.content[attrs.draggableMember];

                    var mousemove = function(event) {
                        if (active) {
                            var minOffsetProperty = direction === 'horizontal' ? element[0].width : element[0].height;
                            var minOffsetComputed = Math.abs(minOffset) - minOffsetProperty;

                            lastX = startX - event.pageX;
                            lastX = Math.max(lastX, minOffsetComputed);
                            lastX = Math.min(lastX, maxOffset);

                            lastY = event.pageY - startY;
                            lastY = Math.max(lastY, minOffsetComputed);
                            lastY = Math.min(lastY, maxOffset);

                            if (direction === 'horizontal') {
                                element.css('right', lastX + 'px');

                                scope.slide.content[attrs.draggableMember] = lastX;
                            } else {
                                element.css('top', lastY + 'px');

                                scope.slide.content[attrs.draggableMember] = lastY;
                            }

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
                            startY = event.pageY - lastY;
                        }
                    };

                    if (scope.slide.isEdit) {
                        container.on('mousedown', mousedown);
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);

                        scope.$watch('slide.content.' + attrs.member, function(picture) {
                            enabled = !!picture;
                        });

                        scope.$on('$destroy', function() {
                            container.off('mousedown', mousedown);
                            $document.off('mousemove', mousemove);
                            $document.off('mouseup', mouseup);
                        });
                    }

                    scope.$watch('slide.content.' + attrs.draggableMember, function(offset) {
                        element.css(direction === 'horizontal' ? 'right' : 'top', offset + 'px');
                    });
                }
            };
        }
    ]);
}());
