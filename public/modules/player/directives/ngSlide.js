'use strict';
angular.module('player').directive('ngSlide', [
	function() {
        return {
            link: function postLink(scope, element, attrs) {
                scope.$parent.templateElements=scope.$parent.templateElements||{};
                scope.$parent.templateElements[attrs.member]="";
                var content = scope.$parent.slide || scope.$parent.currentSlide.content;
                
                scope.$parent.$watch(function(){
                    if (!content){
                        return;
                    }
                    if (element[0].tagName=="IMG")
                    {
                        element[0].src=content[attrs.member];
                        return;
                    }

                    element.text(content[attrs.member]);
                });
			}
		};
	}
]);