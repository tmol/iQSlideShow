/*global module, process*/
(function () {
    'use strict';
    var exports = {
        app: {
            title: 'iQSlideShow',
            description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
            keywords: 'MongoDB, Express, AngularJS, Node.js'
        },
        port: process.env.PORT || 3000,
        templateEngine: 'swig',
        sessionSecret: 'MEAN',
        sessionCollection: 'sessions',
        assets: {
            lib: {
                css: [
                    'public/lib/bootstrap/dist/css/bootstrap.css',
                    'public/lib/bootstrap/dist/css/bootstrap-theme.css'
                ],
                js: [
                    'public/lib/angular/angular.js',
                    'public/lib/angular-resource/angular-resource.js',
                    'public/lib/angular-cookies/angular-cookies.js',
                    'public/lib/angular-animate/angular-animate.js',
                    'public/lib/angular-touch/angular-touch.js',
                    'public/lib/angular-sanitize/angular-sanitize.js',
                    'public/lib/angular-ui-router/release/angular-ui-router.js',
                    'public/lib/angular-ui-utils/ui-utils.js',
                    'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                    'public/lib/jquery/dist/jquery.js',
                    'public/lib/bootstrap/dist/js/bootstrap.js',
                    'public/lib/textAngular/dist/textAngular-rangy.min.js',
                    'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                    'public/lib/textAngular/dist/textAngular.min.js',
                    'public/lib/qrcode/lib/qrcode.min.js',
                    'public/lib/angular-qr/angular-qr.min.js',
                    'public/lib/pubnub/pubnub.min.js',
                    'public/lib/pubnub-angular/lib/pubnub-angular.js',
                    'public/lib/ui-select/dist/select.min.js',
                    'public/lib/angular-ui-grid/ui-grid.min.js',
                    'public/lib/lodash/lodash.min.js'
                ]
            },
            css: [
                'public/lib/font-awesome/css/font-awesome.min.css',
                'public/lib/textAngular/dist/textAngular.css',
                'public/lib/ui-select/dist/select.min.css',
                'public/lib/angular-ui-grid/ui-grid.css'
            ],
            js: [
                'public/config.js',
                'public/application.js'
            ],
            sharedJs: [
                'config/shared/appVersion.js'
            ],
            tests: [
                'public/lib/angular-mocks/angular-mocks.js',
                'public/modules/*/tests/*.js'
            ],
            modules: {}
        }
    };
    exports.addModule = function (moduleName) {
        this.assets.modules[moduleName] = {
            css: [
                'public/modules/' + moduleName + '/css/*.scss',
                'public/modules/' + moduleName + '/css/*.pcss'
            ],
            js: [
                'public/modules/' + moduleName + '/*.js',
                'public/modules/' + moduleName + '/*[!tests]*/*.js',
                'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*.js',
                'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*[!tests]*/*.js',
                'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*[!tests]*/*[!tests]*/*.js'
            ]
        };
        return exports;
    };
    exports
        .addModule('core')
        .addModule('admin')
        .addModule('devices')
        .addModule('player')
        .addModule('slideshows')
        .addModule('users');
    module.exports = exports;
}());
