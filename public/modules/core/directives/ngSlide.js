'use strict';
angular.module('core').directive('ngSlide', [
	function() {

        return {
            link: function postLink(scope, element, attrs) {

                scope.$emit("setTemplateElement", attrs.member, {
                    type:attrs.type||'text',
                    label:attrs.label||attrs.member
                });

                var slide;
                scope.$emit("getSlide", function (value) {
                    slide = value;
                });

                scope.$watch(function(){
                    if (!slide){
                        return;
                    }

                    if (element[0].tagName=="IMG")
                    {
                        element[0].src=slide[attrs.member] || 'modules/slideshows/css/img/default.jpg';
                        return;
                    }
                    if (slide[attrs.member]) {
                        element[0].innerHTML=slide[attrs.member];
                    }
                });
			}
		};
	}
]);
