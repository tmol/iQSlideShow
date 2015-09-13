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
    var injectCss = function(css, callback){
		destroyOldCss();
		
		$http({url:css,cache:true}).success(function(result){
            destroyOldCss();
			oldCss= jQuery("<style id='slideStyle'>" + result + "</style>");
			head.append(oldCss);
            if (callback) {
                callback();
            }
		});
	}
	
    return {
        inject:function(scope,cssPath, callback){
            injectCss(cssPath, callback);
            scope.$on("$destroy",function(){
                destroyOldCss();
            })
        }
    }
});
