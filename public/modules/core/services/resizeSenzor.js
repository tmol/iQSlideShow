/*global angular,$*/
(function () {
    'use strict';


    // Users service used for communicating with the users REST endpoint
    angular.module('core').service('resizeSenzor',
        function () {
            return function (element, onResize) {
                if (element.resizeSensor) {
                    return;
                }
                element.resizeSensor = $(
                    "<div class='resize-sensor' style='position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;'>" +
                        "<div class='resize-sensor-expand' style='position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;'>" +
                            "<div style='position: absolute; left: 0; top: 0; transition: 0s; width:100000px;height:100000px'></div>" +
                        "</div>" +
                        "<div class='resize-sensor-shrink' style='position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;'>" +
                            "<div style='position: absolute; left: 0; top: 0; transition: 0s; width: 200%; height: 200%'></div>" +
                        "</div>" +
                        "</div>"
                );
                $(element).append(element.resizeSensor);

                var expand = element.resizeSensor.find(".resize-sensor-expand");
                var shrink = element.resizeSensor.find(".resize-sensor-shrink");

                var reset = function () {

                    expand.scrollLeft(100000);
                    expand.scrollTop(100000);

                    shrink.scrollLeft(100000);
                    shrink.scrollTop(100000);
                };

                reset();
                var lastWidth, lastHeight;
                var onScroll = function () {
                    var width = element.offsetWidth;
                    var height = element.offsetHeight;
                    if (width !== lastWidth || height !== lastHeight) {
                        lastWidth = width;
                        lastHeight = height;
                        onResize();
                    }
                    reset();
                };
                expand.on('scroll', onScroll);
                shrink.on('scroll', onScroll);
                return function onDetach() {
                    expand.off('scroll');
                    shrink.off('scroll');
                    element.resizeSensor.remove();
                    element.resizeSensor = null;
                    expand = null;
                    shrink = null;
                };
            };
        });
}());
