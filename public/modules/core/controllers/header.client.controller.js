'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$window', 'Authentication', 'Menus',
	function($scope, $window, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

        $(document).keydown(function (e) {
			if (e.keyCode == 80) {
                $window.open('/slideshow#!/player', '_blank');
            }
        });

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
