/*jslint nomen: true, vars: true*/
/*global _, angular*/
(function () {
    'use strict';
    angular.module('core', ['textAngular']).config(['$provide',
        function ($provide) {
            // this demonstrates how to register a new tool and add it to the default toolbar
            $provide.decorator('taOptions', ['$delegate', function (taOptions) {
                // $delegate is the taOptions we are decorating
                // here we override the default toolbars and classes specified in taOptions.
                taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
                taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
                taOptions.toolbar = [
                    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
                    ['bold', 'italics', 'underline', 'strikeThrough'],
                    ['ul', 'ol'],
                    ['justifyLeft', 'jsustifyRight', 'justifyCenter', 'justifyFull'],
                    ['insertImage'],
                    ['insertLink'],
                    ['html'],
                    ['undo', 'redo'],
                ];
                /*taOptions.classes = {
                    focussed: 'focussed',
                    toolbar: 'btn-toolbar',
                    toolbarGroup: 'btn-group',
                    toolbarButton: 'btn btn-default',
                    toolbarButtonActive: 'active',
                    disabled: 'disabled',
                    textEditor: 'form-control',
                    htmlEditor: 'form-control'
                };*/
                return taOptions; // whatever you return will be the taOptions
            }]);
            // this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
            /*$provide.decorator('taTools', ['$delegate', function (taTools) {
                taTools.bold.iconclass = 'fa fa-bold';
                taTools.italics.iconclass = 'fa fa-italic';
                taTools.underline.iconclass = 'fa fa-underline';
                taTools.ul.iconclass = 'fa fa-list-ul';
                taTools.ol.iconclass = 'fa fa-list-ol';
                taTools.undo.iconclass = 'fa fa-undo';
                taTools.redo.iconclass = 'fa fa-repeat';
                taTools.justifyLeft.iconclass = 'fa fa-align-left';
                taTools.justifyRight.iconclass = 'fa fa-align-right';
                taTools.justifyCenter.iconclass = 'fa fa-align-center';
                taTools.clear.iconclass = 'icon-ban-circle';
                taTools.insertLink.iconclass = 'fa fa-link';
                taTools.insertImage.iconclass = 'fa fa-image';
                taTools.quote.iconclass = 'fa fa-quote-left';
                return taTools;
            }]);*/
        }]);
}());
