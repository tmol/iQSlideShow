function PowerPointScript($scope, $timeout) {
    $scope.onClick = function() {
       $timeout(function(){alert(1);},20);
    }
    $scope.$on("scriptLoaded", function (event, scriptUrl) {
        console.log(scriptUrl);
    });
}
