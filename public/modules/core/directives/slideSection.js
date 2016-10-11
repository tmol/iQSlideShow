/*global angular*/
(function () {
    'use strict';
    angular.module('core').directive('slideSection', ['ScriptInjector',
        function (ScriptInjector) {
            return {
                link: function postLink(scope, element, attrs) {
                    var members = element.find('[slide-part]').map(function(index, child) {
                        return "slide.content." + $(child).attr("member");
                    });

                    scope.$watchGroup(members, function (values) {
                        if (_.some(values)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });
                }
            };
        }
    ]);
}());
