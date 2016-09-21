/*global angular*/
(function () {
    'use strict';

    angular.module('core').directive('qrDeviceInteraction', function () {
        var template = '';
        template += '<a href="{{qrConfig.slideUrl}}" target="_blank">';
        template += '    <qr text="qrConfig.slideUrl" type-number="qrConfig.typeNumber" correction-level="qrConfig.correctionLevel"';
        template += '        size="qrConfig.size" input-mode="qrConfig.inputMode" image="qrConfig.image">';
        template += '    </qr>';
        template += '</a>';

        return {
            restrict: 'AE',
            template: template,
        };
    });
}());
