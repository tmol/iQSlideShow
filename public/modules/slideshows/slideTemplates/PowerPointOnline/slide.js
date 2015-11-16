function ($scope,$timeout) {
    $scope.onClick = function() {
       $timeout(function(){alert(1);},20);
    }
}
