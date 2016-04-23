'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'ActionResultDialogService', 'EmailValidator',
	function($scope, $http, $location, Users, Authentication, ActionResultDialogService, EmailValidator) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

        $scope.profileDataValid = function () {
            return $scope.user.firstName
               && $scope.user.lastName
               && $scope.user.username
               && EmailValidator.validate($scope.user.email);
        }

		// Update a user profile
		$scope.updateUserProfile = function() {
            if (!$scope.profileDataValid()) {
                return;
            }
            var user = new Users($scope.user);

            user.$update(function(response) {
                $scope.success = true;
                Authentication.user = response;
                ActionResultDialogService.showOkDialog('Update succeeded', $scope);
            }, function(response) {
                ActionResultDialogService.showErrorDialog('Update unsuccessful', response.data.message, $scope);
            });
		};

		// Change user password
		$scope.changeUserPassword = function() {
            if (!$scope.passwordDetails.currentPassword
               || !$scope.passwordDetails.newPassword
               || !$scope.passwordDetails.verifyPassword) {
                return;
            }
            if ($scope.passwordDetails.newPassword !== $scope.passwordDetails.verifyPassword) {
                ActionResultDialogService.showWarningDialog('New password and verify password do not match.', $scope, function () { return; })
            } else {
                $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                    ActionResultDialogService.showOkDialog('Password change succeeded', $scope);
                    $scope.passwordDetails = null;
                }).error(function(response) {
                    ActionResultDialogService.showErrorDialog('Update unsuccessful', response.message, $scope);
                });
            }
		};
	}
]);
