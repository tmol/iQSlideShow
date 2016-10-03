'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$window', 'Authentication', 'Menus', '$state', '$rootScope',
	function($scope, $window, Authentication, Menus, $state, $rootScope) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');
		$scope.settings = Menus.getMenu('settings');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

        $(document).keydown(function (e) {
			if (e.keyCode == 80 && e.ctrlKey) {
				e.preventDefault();
                $window.open('/slideshow#!/player', '_blank');
            }
        });

        $scope.isItemSelected = function (item) {
			var currentUrl = $state.current.url.substring(1); // Remove leading slash.

			if (item.link === currentUrl) {
				return true;
			} else {
				return _.some(item.items, { link: currentUrl });
			}
        };

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
