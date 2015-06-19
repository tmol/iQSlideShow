'use strict';
angular.module('player').factory("CssInjector", function($http){
    var oldCss;
    var head = jQuery(document.getElementsByTagName('head')[0]);
    var destroyOldCss = function(){
        if (oldCss){
            oldCss.remove();
            oldCss=null;
        }
    }
    var injectCss = function(css){
		destroyOldCss();
		
		$http({url:css,cache:true}).success(function(result){
			oldCss= jQuery("<style id='slideStyle'>" + result + "</style>");
			head.append(oldCss);
		});
	}
	
    return {
        inject:function(scope,cssPath){
            destroyOldCss();
            injectCss(cssPath);
            scope.$on("$destroy",function(){
                destroyOldCss();
            })
        }
    }
});