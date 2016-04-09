/*global angular, removeLocationFromFilter, _*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('dragAndDropReceiver', ['$timeout', function ($timeout) {
    'use strict';

    function link(scope, element, attrs) {
        var draggableItemsArray = scope.getDraggableItemsArray().dragAndDropItemsArray,
            dragAndDropId,
            lastMoveHorizontalApproach,
            lastMoveVerticalApproach;

        function getElementBoundaries(element) {
            var offset = element.offset();
            return {
                x1: offset.left,
                y1: offset.top,
                x2: offset.left + element.width(),
                y2: offset.top + element.height()
            };
        }

        function getElementDragAndDropId(element) {
            var dragAndDropId;
            if (element && element[0] && element[0].attributes.dragAndDropId) {
                dragAndDropId = element[0].attributes.dragAndDropId.value;
            }
            return dragAndDropId;
        }

        function handleDrop(dropEventArgs) {
            var draggedDragAndDropId = getElementDragAndDropId(dropEventArgs.element);

            if (dragAndDropId !== draggedDragAndDropId) {
                return;
            }
            draggableItemsArray.dropItem(draggedDragAndDropId);
        }

        function handleDrag(dragEventArgs) {
            var draggedElement = dragEventArgs.element,
                draggedDragAndDropId = getElementDragAndDropId(draggedElement);
            if (dragAndDropId === draggedDragAndDropId) {
                return;
            }

            var myBoundaries = getElementBoundaries(element);
            var draggedElementBoundaries = getElementBoundaries(draggedElement);

            var x_overlap = Math.max(0, Math.min(myBoundaries.x2, draggedElementBoundaries.x2) - Math.max(myBoundaries.x1, draggedElementBoundaries.x1));
            var y_overlap = Math.max(0, Math.min(myBoundaries.y2, draggedElementBoundaries.y2) - Math.max(myBoundaries.y1, draggedElementBoundaries.y1));
            var overlapArea = x_overlap * y_overlap;
            var draggedElementArea = (draggedElementBoundaries.y2 - draggedElementBoundaries.y1) * (draggedElementBoundaries.x2 - draggedElementBoundaries.x1);
            if (overlapArea > draggedElementArea / 2) {
                var horizontalApproach = (dragEventArgs.horizontalDelta > 0) ? 'left' : 'right';
                var verticalApproach = (dragEventArgs.horizontalDelta < 0) ? 'top' : 'bottom';

                if (lastMoveHorizontalApproach !== horizontalApproach
                        || lastMoveVerticalApproach !== verticalApproach) {
                    draggableItemsArray.moveItem(dragAndDropId, horizontalApproach, verticalApproach);
                    lastMoveHorizontalApproach = horizontalApproach;
                    lastMoveVerticalApproach = verticalApproach;
                }
            }
        }

        scope.$on(scope.elementDraggedEventName, function (event, args) {
            if (args.handled || !dragAndDropId) {
                return;
            }

            if (args.dragAndDropEvent === 'drag') {
                handleDrag(args);
            } else if (args.dragAndDropEvent === 'drop') {
                handleDrop(args);
            }
        });

        $timeout(function () {
            dragAndDropId = getElementDragAndDropId(element);
        });
    }

    return {
        link: link,
        scope: {
            elementDraggedEventName: '=',
            getDraggableItemsArray: '&'
        }
    };
}]);
