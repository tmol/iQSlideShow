'use strict';
angular.module('player').factory("JsInjector", function($http){
    var oldJs;
    var head = jQuery(document.getElementsByTagName('head')[0]);
    var destroyOldJs = function(){
        if (oldJs){
            oldJs.remove();
            oldJs=null;
        }
    }
    var injectJs = function(css, callback){
		$http({url:css,cache:true}).success(function(result){
            var func;
			eval("func=" + result);
            if (callback) {
                callback(func);
            }
		}).error(function(){
            if (callback) {
                callback(null);
            }
        });
	}

    return {
        inject:function(cssPath, callback){
            injectJs(cssPath, callback);
        }
    }
});
