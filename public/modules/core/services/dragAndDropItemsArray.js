/*global angular, _*/
(function () {
    'use strict';
    angular.module('core').service('DragAndDropItemsArray',
        function () {
            return function (draggedArray) {
                var items = draggedArray.items;
                this.getIndexByDragAndDropId = function (dragAndDropId) {
                    return _.findIndex(items, function (item) {
                        return item.dragAndDropId === dragAndDropId;
                    });
                };

                this.getItemByDragAndDropId = function (dragAndDropId) {
                    var itemIdx = this.getIndexByDragAndDropId(dragAndDropId);
                    return items[itemIdx];
                };

                this.moveItemInItemsList = function (item, newIndex) {
                    var index = items.indexOf(item);

                    if (newIndex < 0 || newIndex > items.length - 1) {
                        return;
                    }

                    items.splice(index, 1);
                    items.splice(newIndex, 0, item);
                };

                this.dragItem = function (dragAndDropId) {
                    var item = this.getItemByDragAndDropId(dragAndDropId);
                    item.moveStatus = 'drag';
                };

                this.dropItem = function (dragAndDropId) {
                    var item = this.getItemByDragAndDropId(dragAndDropId);
                    this.moveItemInItemsList(item, draggedArray.lastIndexMovedDuringDragAndDrop);
                    _.forEach(items, function (item) {
                        delete item.moveStatus;
                        delete item.lastMoveDirection;
                    });
                    draggedArray.itemsChanged();
                    draggedArray.itemDropped(item);
                };

                var approachIsFromDirection = function (horizontalApproach, verticalApproach, direction) {
                    if (direction === 'prev') {
                        return horizontalApproach === 'left' || verticalApproach === 'top';
                    } else if (direction === 'next') {
                        return horizontalApproach === 'right' || verticalApproach === 'bottom';
                    }
                };

                this.moveItem = function (dragAndDropId, horizontalApproach, verticalApproach) {
                    var item = this.getItemByDragAndDropId(dragAndDropId),
                        setMoveStatus = function (direction, nonCenterMoveStatus, oppositeMoveStatus, moveToCenterStatus) {
                            if (approachIsFromDirection(horizontalApproach, verticalApproach, direction)
                                    && item.moveStatus !== nonCenterMoveStatus
                                    && item.lastMoveDirection !== direction) {
                                if (item.moveStatus === oppositeMoveStatus) {
                                    item.moveStatus = moveToCenterStatus;
                                } else {
                                    item.moveStatus = nonCenterMoveStatus;
                                }
                                item.lastMoveDirection = direction;
                            }
                        };

                    console.log('horizontalApproach: ' + horizontalApproach + ', moveStatus: ' + item.moveStatus + ', lastMoveDirection:' + item.lastMoveDirection);
                    setMoveStatus('prev', 'movePrev', 'moveNext', 'moveCenterFromNext');
                    setMoveStatus('next', 'moveNext', 'movePrev', 'moveCenterFromPrev');
                    console.log('horizontalApproach: ' + horizontalApproach + ',' + item.moveStatus);
                    console.log('   ');
                    draggedArray.lastIndexMovedDuringDragAndDrop = this.getIndexByDragAndDropId(dragAndDropId);
                    draggedArray.itemsChanged();
                };
            };
        });
}());
