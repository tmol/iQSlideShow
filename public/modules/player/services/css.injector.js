'use strict';
angular.module('player').factory("CssInjector", function($timeout, $http){
    var head = jQuery(document.getElementsByTagName('head')[0]);

    var cssCollection = {};
    var injectCss = function(css, callback){
        if (cssCollection[css]) {
            if (callback) {
                callback();
            }
            return;
        }
		$http({url:css,cache:true}).success(function(result){
        	cssCollection[css] = jQuery("<style>" + result + "</style>");
			head.append(cssCollection[css]);
            if (callback) {
                callback();
            }
		});
	}
	
    return {
        inject:function(scope,cssPath, callback){
            injectCss(cssPath, callback);
            scope.$on("$destroy",function(){
                for(var name in cssCollection) {
                    cssCollection[name].remove();
                }
            })
        }
    }
});
