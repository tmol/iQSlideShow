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

            $document.bind('scroll', function () {
                var remaining = body.scrollHeight - (body.clientHeight + body.scrollTop);

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
            });
        }

        return {
            link: link,
            scope: {
                scrollThreshold: '=',
                timeThreshold: '=',
                handler: '&'
            }
        };
    }]);
})(angular);
