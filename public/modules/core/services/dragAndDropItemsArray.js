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
                    var playListItem = this.getItemByDragAndDropId(dragAndDropId);
                    playListItem.moveStatus = 'drag';
                };

                this.dropItem = function (dragAndDropId) {
                    var playListItem = this.getItemByDragAndDropId(dragAndDropId);
                    this.moveItemInItemsList(playListItem, draggedArray.lastIndexMovedDuringDragAndDrop);
                    _.forEach(items, function (item) {
                        delete item.moveStatus;
                        delete item.lastMoveDirection;
                    });
                    draggedArray.itemsChanged();
                };

                this.moveItem = function (dragAndDropId, horizontalApproach) {
                    var playListItem = this.getItemByDragAndDropId(dragAndDropId),
                        setMoveStatus = function (direction, nonCenterMoveStatus, oppositeMoveStatus, moveToCenterStatus) {
                            if (horizontalApproach === direction
                                    && playListItem.moveStatus !== nonCenterMoveStatus
                                    && playListItem.lastMoveDirection !== direction) {
                                if (playListItem.moveStatus === oppositeMoveStatus) {
                                    playListItem.moveStatus = moveToCenterStatus;
                                } else {
                                    playListItem.moveStatus = nonCenterMoveStatus;
                                }
                                playListItem.lastMoveDirection = direction;
                            }
                        };

                    console.log('horizontalApproach: ' + horizontalApproach + ', moveStatus: ' + playListItem.moveStatus + ', lastMoveDirection:' + playListItem.lastMoveDirection);
                    setMoveStatus('left', 'moveLeft', 'moveRight', 'moveCenterFromRight');
                    setMoveStatus('right', 'moveRight', 'moveLeft', 'moveCenterFromLeft');
                    console.log('horizontalApproach: ' + horizontalApproach + ',' + playListItem.moveStatus);
                    console.log('   ');
                    draggedArray.lastIndexMovedDuringDragAndDrop = this.getIndexByDragAndDropId(dragAndDropId);
                    draggedArray.itemsChanged();
                };
            };
        });
}());
