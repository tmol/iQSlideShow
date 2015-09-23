/*global require, exports*/
(function () {
    'use strict';
    exports.getSupportedAgregations = function () {
        return ['sequential'];
    };
    exports.getPlayList = function (aggregationType) {
        var aggregation = require('./' + aggregationType);
        return aggregation;
    };
}());
