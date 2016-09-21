/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('dragAndDrop', ['$document', function ($document) {
    'use strict';

    function link(scope, element, attrs) {
        var startX = 0,
            startY = 0,
            x = 0,
            y = 0,
            lastPageX,
            lastPageY,
            scrolling = false;

        element.css({
            position: 'relative'
        });

        function moveTo(x, y) {
            element.css({
                top: y + 'px',
                left:  x + 'px'
            });
        }

        function scroll(distanceInPixels) {
            var body = $document[0].body;

            if (scrolling) {
                return;
            }

            scrolling = true;
            angular.element('body').animate({
                scrollTop: body.scrollTop + distanceInPixels
            }, 'fast', function () {
                scrolling = false;
            });
        }

        function getRelativePosition(mouseEvent) {
            var x = mouseEvent.pageX - startX,
                y = mouseEvent.pageY - startY;
            if ('horizontalOnly' === scope.dragAndDropMode) {
                y = 0;
            }
            if ('verticalOnly' === scope.dragAndDropMode) {
                x = 0;
            }
            return { x: x, y: y};
        }

        function broadcastEvent(dragAndDropEvent, mouseEvent) {
            var relativePosition = getRelativePosition(mouseEvent);
            if (relativePosition.x === 0 && relativePosition.y === 0) {
                return;
            }
            if (scope.dragAndDropMoveEventName) {
                scope.$root.$broadcast(scope.dragAndDropMoveEventName, {
                    x: relativePosition.x,
                    y: relativePosition.y,
                    horizontalDelta: mouseEvent.pageX - lastPageX,
                    verticalDelta: mouseEvent.pageY - lastPageY,
                    element: element,
                    dragAndDropEvent: dragAndDropEvent
                });
            }
        }

        function mousemove(event) {
            var relativePosition = getRelativePosition(event);
            moveTo(relativePosition.x, relativePosition.y);
            broadcastEvent('drag', event);
            element.addClass(scope.dragAndDropDraggingClass);
            lastPageX = event.pageX;
            lastPageY = event.pageY;

            var body = $document[0].body;
            if (event.pageY > body.clientHeight +  body.scrollTop - scope.dragAndDropFooterHeight) {
                scroll(50);
            } else if (event.pageY < body.scrollTop + scope.dragAndDropHeaderHeight) {
                scroll(-50);
            }
        }

        function mouseup(event) {
            broadcastEvent('drop', event);
            element.removeClass(scope.dragAndDropDraggingClass);
            x = 0;
            y = 0;
            moveTo(0, 0);
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
        }

        element.on('mousedown', function (event) {
            // Prevent default dragging of selected content
            event.preventDefault();
            startX = event.pageX - x;
            startY = event.pageY - y;
            lastPageX = event.pageX;
            lastPageY = event.pageY;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });
    }

    return {
        link: link,
        scope: {
            dragAndDropHeaderHeight: '=',
            dragAndDropFooterHeight: '=',
            dragAndDropMoveEventName: '=',
            dragAndDropDraggingClass: '=',
            dragAndDropMode: '='
        }
    };
}]);
