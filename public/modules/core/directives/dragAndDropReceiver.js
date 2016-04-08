/*global angular, removeLocationFromFilter, _*/
/*jslint nomen: true, es5: true */
angular.module('core').directive('dragAndDropReceiver', ['$timeout', function ($timeout) {
    'use strict';

    function link(scope, element, attrs) {
        var draggableItemsArray = scope.getDraggableItemsArray(),
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

        function getDraggableItemIndex(dragAndDropId) {
            return _.findIndex(draggableItemsArray.items, function (item) {
                return item.dragAndDropId === dragAndDropId;
            });
        }

       function handleDrop(targetItemId, draggedItemId) {
            var targetItemIndex = getDraggableItemIndex(targetItemId);
            if (targetItemIndex === -1) {
                return;
            }

            var draggedItemIndex = getDraggableItemIndex(draggedItemId);
            if (draggedItemIndex === -1) {
                return;
            }

            var indexAdjuster = (draggedItemIndex > targetItemIndex) ? 1 : 0;
            var draggedItem = draggableItemsArray.items.splice(draggedItemIndex, 1)[0];
            draggableItemsArray.items.splice(targetItemIndex + indexAdjuster, 0, draggedItem);
            scope.$apply();
        }

        scope.$on(scope.elementDraggedEventName, function (event, args) {
            var draggedElement = args.element,
                draggedDragAndDropId = getElementDragAndDropId(draggedElement);

            if (args.handled || !dragAndDropId) {
                return;
            }

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
                if (args.dragAndDropEvent === 'drag') {
                    var horizontalApproach = (args.horizontalDelta > 0) ? 'left' : 'right';
                    var verticalApproach = (args.horizontalDelta < 0) ? 'top' : 'bottom';

                    if (lastMoveHorizontalApproach !== horizontalApproach
                            || lastMoveVerticalApproach !== verticalApproach) {
                        draggableItemsArray.moveItem(dragAndDropId, horizontalApproach, verticalApproach);
                        lastMoveHorizontalApproach = horizontalApproach;
                        lastMoveVerticalApproach = verticalApproach;
                    }
                }
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
