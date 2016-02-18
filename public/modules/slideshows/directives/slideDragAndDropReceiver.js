/*global angular, removeLocationFromFilter*/
/*jslint nomen: true, es5: true */
angular.module('slideshows').directive('slideDragAndDropReceiver', function () {
    'use strict';

    function link(scope, element, attrs) {
        function getDraggedSlideId(draggedSlideElement) {
            if (draggedSlideElement && draggedSlideElement[0] && draggedSlideElement[0].attributes.slideShowId) {
                return draggedSlideElement[0].attributes.slideShowId.value;
            }

            return null;
        }

        function getElementBoundaries(element) {
            var offset = element.offset();
            return {
                x1: offset.left,
                y1: offset.top,
                x2: offset.left + element.width(),
                y2: offset.top + element.height()
            };
        }

        var initialBorderStyle = element.css('border');

        function revertToInitialStyle() {
            element.removeClass('iqss-slideshowedit-slide-readyToReceiveDrop');
        }

        function setDraggingStyle() {
            element.addClass('iqss-slideshowedit-slide-readyToReceiveDrop');
        }

        scope.$on('slideShowDragged', function (event, args) {
            if (!attrs.slideshowid || args.handled) {
                return;
            }
            var draggedSlideId = getDraggedSlideId(args.element);
            if (attrs.slideshowid === draggedSlideId) {
                return;
            }
            var myBoundaries = getElementBoundaries(element);
            var draggedElementBoundaries = getElementBoundaries(args.element);

            var x_overlap = Math.max(0, Math.min(myBoundaries.x2, draggedElementBoundaries.x2) - Math.max(myBoundaries.x1, draggedElementBoundaries.x1));
            var y_overlap = Math.max(0, Math.min(myBoundaries.y2, draggedElementBoundaries.y2) - Math.max(myBoundaries.y1, draggedElementBoundaries.y1));
            var overlapArea = x_overlap * y_overlap;
            var draggedElementArea = (draggedElementBoundaries.y2 - draggedElementBoundaries.y1) * (draggedElementBoundaries.x2 - draggedElementBoundaries.x1);
            if (overlapArea > draggedElementArea / 2) {
                if (args.dragAndDropEvent === 'drop') {
                    scope.$parent.slideDropped(attrs.slideshowid, draggedSlideId);
                    args.handled = true;
                    revertToInitialStyle();
                } else {
                    setDraggingStyle();
                }
            } else {
                revertToInitialStyle();
            }
        });
    }

    return {
        link: link
    };
});
