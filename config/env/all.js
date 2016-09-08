/*global module, process*/
(function () {
    'use strict';
    var lodash = require('lodash'),
        adminModules = ['core', 'admin', 'devices', 'slideshows', 'users', 'blueprints', 'player'],
        playerModules = ['core', 'player'],
        exports = {
            app: {
                title: 'iQSlideShow',
                description: 'Bring valuable information to employees in a easily manageable and interactive way using big screen devices.',
                keywords: 'Slideshows, big screen, real time devie management'
            },
            port: process.env.PORT || 3000,
            templateEngine: 'swig',
            sessionSecret: 'iqslideshow',
            sessionCollection: 'sessions',
            assets: {
                lib: {
                    css: [
                        'public/lib/bootstrap/dist/css/bootstrap.css',
                        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                        'public/lib/jquery-ui/themes/base/jquery-ui.css'
                    ],
                    js: [
                        'public/lib/jquery/dist/jquery.js',
                        'public/lib/fastclick/lib/fastclick.js',
                        'public/lib/angular/angular.js',
                        'public/lib/angular-resource/angular-resource.js',
                        'public/lib/angular-cookies/angular-cookies.js',
                        'public/lib/angular-animate/angular-animate.js',
                        'public/lib/angular-touch/angular-touch.js',
                        'public/lib/angular-sanitize/angular-sanitize.js',
                        'public/lib/angular-ui-router/release/angular-ui-router.js',
                        'public/lib/angular-ui-utils/ui-utils.js',
                        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                        'public/lib/bootstrap/dist/js/bootstrap.js',
                        'public/lib/textAngular/dist/textAngular-rangy.min.js',
                        'public/lib/textAngular/dist/textAngular-sanitize.js',
                        'public/lib/textAngular/dist/textAngular.min.js',
                        'public/lib/qrcode/lib/qrcode.js',
                        'public/lib/angular-qr/src/angular-qr.js',
                        'public/lib/pubnub/pubnub.min.js',
                        'public/lib/ui-select/dist/select.js',
                        'public/lib/angular-ui-grid/ui-grid.js',
                        'public/lib/lodash/lodash.js',
                        'public/lib/angular-ui-slider/src/slider.js',
                        'public/lib/jquery-ui/ui/jquery-ui.js',
                        'public/lib/jquery-textfill/source/jquery.textfill.min.js'
                    ]
                },
                css: [
                    'public/lib/font-awesome/css/font-awesome.css',
                    'public/lib/textAngular/dist/textAngular.css',
                    'public/lib/ui-select/dist/select.css',
                    'public/lib/angular-ui-grid/ui-grid.css',
                    'public/css/*.css'
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
                admin: { css: [], js: [] },
                player: { css: [], js: [] }
            }
        };

    exports.addModuleJsToAsset = function (moduleName, asset) {
       asset.js.push([
            'public/modules/' + moduleName + '/*.js',
            'public/modules/' + moduleName + '/*[!tests]*/*.js',
            'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*.js',
            'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*[!tests]*/*.js',
            'public/modules/' + moduleName + '/*[!tests]*/*[!tests]*/*[!tests]*/*[!tests]*/*.js'
        ]);
    };

    exports.addModule = function (moduleName, asset) {
        asset.css.push('public/modules/' + moduleName + '/css/*.css');
        this.addModuleJsToAsset(moduleName, asset);
    };

    exports.addAdminModule = function (moduleName) {
        this.addModule(moduleName, this.assets.admin);
    };

    exports.addPlayerModule = function (moduleName) {
        this.addModule(moduleName, this.assets.player);
    };

    exports.init = function ()  {
        var me = this;
        lodash(adminModules).forEach(function(moduleName) {
            me.addAdminModule(moduleName);
        });
        lodash(playerModules).forEach(function(moduleName) {
            me.addPlayerModule(moduleName);
        });
    }

    exports.init();

    module.exports = exports;
}());
