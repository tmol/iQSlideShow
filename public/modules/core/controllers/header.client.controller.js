'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$window', 'Authentication', 'Menus', '$state', '$rootScope',
	function($scope, $window, Authentication, Menus, $state, $rootScope) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

        $(document).keydown(function (e) {
			if (e.keyCode == 80 && e.ctrlKey) {
                $window.open('/slideshow#!/player', '_blank');
            }
        });

        $scope.isStateSelected = function (link) {
            return $state.current.url === "/" + link;
        };

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
