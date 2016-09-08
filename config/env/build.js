/*global module, process*/
(function () {
    'use strict';
    var lodash = require('lodash'),
        all = require('./all'),
        exports = {
            assets: {
                lib: {
                    adminCss: [
                        'public/lib/bootstrap/dist/css/bootstrap.min.css',
                        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                        'public/lib/jquery-ui/themes/base/minified/jquery-ui.min.css',
                        'public/lib/font-awesome/font-awesome.min.css'
                    ],
                    adminJs: [
                        'public/lib/jquery/dist/jquery.min.js',
                        'public/lib/fastclick/lib/fastclick.js',
                        'public/lib/angular/angular.min.js',
                        'public/lib/angular-resource/angular-resource.min.js',
                        'public/lib/angular-cookies/angular-cookies.min.js',
                        'public/lib/angular-animate/angular-animate.min.js',
                        'public/lib/angular-touch/angular-touch.min.js',
                        'public/lib/angular-sanitize/angular-sanitize.min.js',
                        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                        'public/lib/angular-ui-utils/ui-utils.min.js',
                        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                        'public/lib/bootstrap/dist/js/bootstrap.min.js',
                        'public/lib/textAngular/dist/textAngular-rangy.min.js',
                        'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                        'public/lib/textAngular/dist/textAngular.min.js',
                        'public/lib/qrcode/lib/qrcode.min.js',
                        'public/lib/angular-qr/angular-qr.min.js',
                        'public/lib/pubnub/pubnub.min.js',
                        'public/lib/ui-select/dist/select.min.js',
                        'public/lib/angular-ui-grid/ui-grid.min.js',
                        'public/lib/lodash/dist/lodash.min.js',
                        'public/lib/angular-ui-slider/src/slider.js',
                        'public/lib/jquery-ui/ui/minified/jquery-ui.min.js',
                        'public/lib/jquery-textfill/source/jquery.textfill.min.js'
                    ],
                    playerCss: [
                        'public/lib/bootstrap/dist/css/bootstrap.min.css',
                        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                        'public/lib/jquery-ui/themes/base/minified/jquery-ui.min.css'
                    ],
                    playerJs: [
                        'public/lib/jquery/dist/jquery.min.js',
                        'public/lib/fastclick/lib/fastclick.js',
                        'public/lib/angular/angular.min.js',
                        'public/lib/angular-resource/angular-resource.min.js',
                        'public/lib/angular-cookies/angular-cookies.min.js',
                        'public/lib/angular-animate/angular-animate.min.js',
                        'public/lib/angular-touch/angular-touch.min.js',
                        'public/lib/angular-sanitize/angular-sanitize.min.js',
                        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                        'public/lib/angular-ui-utils/ui-utils.min.js',
                        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                        'public/lib/bootstrap/dist/js/bootstrap.min.js',
                        'public/lib/textAngular/dist/textAngular-rangy.min.js',
                        'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                        'public/lib/textAngular/dist/textAngular.min.js',
                        'public/lib/qrcode/lib/qrcode.min.js',
                        'public/lib/angular-qr/angular-qr.min.js',
                        'public/lib/pubnub/pubnub.min.js',
                        'public/lib/ui-select/dist/select.min.js',
                        'public/lib/angular-ui-grid/ui-grid.min.js',
                        'public/lib/lodash/dist/lodash.min.js',
                        'public/lib/angular-ui-slider/src/slider.js',
                        'public/lib/jquery-ui/ui/minified/jquery-ui.min.js',
                        'public/lib/jquery-textfill/source/jquery.textfill.min.js'
                    ],
                },
                adminCss: [
                    'public/lib/font-awesome/css/font-awesome.min.css',
                    'public/lib/textAngular/dist/textAngular.css',
                    'public/lib/ui-select/dist/select.min.css',
                    'public/lib/angular-ui-grid/ui-grid.min.css',
                    'public/css/*.css'
                ],
                playerCss: [
                    'public/lib/font-awesome/css/font-awesome.min.css',
                    'public/lib/textAngular/dist/textAngular.css',
                    'public/lib/ui-select/dist/select.min.css',
                    'public/lib/angular-ui-grid/ui-grid.min.css',
                    'public/css/*.css'
                ],
                js: all.assets.js,
                sharedJs: all.assets.sharedJs,
                admin: all.assets.admin,
                player: all.assets.player,
                allAdminJs: [],
                allAdminCss: [],
                allPlayerJs: [],
                allPlayerCss: [] ,
                init: function () {
                    var commonJs = this.js.concat(this.sharedJs);
                    this.allAdminJs = this.lib.adminJs.concat(commonJs).concat(this.admin.js);
                    this.allAdminCss = this.lib.adminCss.concat(this.adminCss).concat(this.admin.css);
                    this.allPlayerJs = this.lib.playerJs.concat(commonJs).concat(this.player.js);
                    this.allPlayerCss = this.lib.playerCss.concat(this.playerCss).concat(this.player.css);
                }
            }
        };
    exports.assets.init();

    module.exports = exports;
}());
