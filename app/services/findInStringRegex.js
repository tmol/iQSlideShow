/*jslint nomen: true, vars: true*/
/*global require, exports, console*/
(function () {
    'use strict';

    exports.getFindInTextRegExp = function (filter) {
        return new RegExp('.*' + filter + '.*', 'i');
    };
})();
