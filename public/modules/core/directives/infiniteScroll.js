/*global angular*/
(function (ng) {
    'use strict';
    angular.module('core').directive('infiniteScroll', ['$timeout', '$document', function (timeout, $document) {
        function link(scope, element, attr) {
            var lengthThreshold = attr.scrollThreshold || 50,
                timeThreshold = attr.timeThreshold || 400,
                promise = null,
                lastRemaining = 9999,
                body = $document[0].body;

            lengthThreshold = parseInt(lengthThreshold, 10);
            timeThreshold = parseInt(timeThreshold, 10);

            if (!scope.handler || !ng.isFunction(scope.handler)) {
                scope.handler = ng.noop;
            }

            var scrollCallback = function () {
                var scrollTop, scrollHeight, totalHeight;

                if (scope.scrollElement) {
                    scrollTop = element.scrollTop();
                    scrollHeight = element[0].scrollHeight;
                    totalHeight = element.height();
                } else {
                    scrollTop = Math.max(this.documentElement.scrollTop, body.scrollTop); // same as above
                    scrollHeight = Math.max(this.documentElement.scrollHeight, body.scrollHeight); // the first for Firefox, second for Chrome, couldn't find something common
                    totalHeight = body.clientHeight;
                }

                var remaining = scrollHeight - (totalHeight + scrollTop);

                if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {
                    if (promise !== null) {
                        timeout.cancel(promise);
                    }

                    promise = timeout(function () {
                        scope.handler();
                        promise = null;
                    }, timeThreshold);
                }

                lastRemaining = remaining;
            };
            
            if (scope.scrollElement) {
                element.on('scroll', scrollCallback);
            } else {
                $document.on('scroll', scrollCallback);
            }
        }

        return {
            link: link,
            scope: {
                scrollElement: '=',
                scrollThreshold: '=',
                timeThreshold: '=',
                handler: '&'
            }
        };
    }]);
})(angular);
