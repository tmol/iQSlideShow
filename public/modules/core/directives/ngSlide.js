'use strict';
angular.module('core').directive('ngSlide', [
	function() {

        return {
            link: function postLink(scope, element, attrs) {
                scope.$parent.templateElements=scope.$parent.templateElements||{};
                scope.$parent.templateElements[attrs.member]={
                    type:attrs.type||'text',
                    label:attrs.label||attrs.member
                };
                var content = scope.$parent.slide || scope.$parent.currentSlide.content;
                if (scope.$parent.slide) {
                    content = scope.$parent.slide.content || content;
                }
                scope.$parent.$watch(function(){
                    if (!content){
                        return;
                    }

                    if (element[0].tagName=="IMG")
                    {
                        element[0].src=content[attrs.member] || 'modules/slideshows/css/img/default.jpg';
                        return;
                    }

                    element[0].innerHTML=content[attrs.member];
                });
			}
		};
	}
]);
