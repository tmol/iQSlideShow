'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$stateParams', 'Base64', 'ActionResultDialogService', 'EmailValidator',
	function($scope, $http, $location, Authentication, $stateParams, base64, ActionResultDialogService, EmailValidator) {
		$scope.authentication = Authentication;
        $scope.emailValidator = EmailValidator;
        $scope.signInTriggered = false;
        $scope.signUpTriggered = false;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
            $scope.signUpTriggered = true;
            if (!$scope.credentials) {
                $scope.credentials = {};
                return;
            }
            if (!$scope.credentials.firstName
               || !$scope.credentials.lastName
               || !$scope.credentials.lastName
               || !$scope.emailValidator.validate($scope.credentials.email)
               || !$scope.credentials.username
               || !$scope.credentials.password) {
                return;
            }
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
                if (response.message === 'duplicate') {
                    response.message = 'Username already exists.';
                }
                ActionResultDialogService.showWarningDialog(response.message, $scope);
			});
		};

		$scope.signin = function() {
            $scope.signInTriggered = true;
            if (!$scope.credentials) {
                $scope.credentials = {};
                return;
            }
            if (!$scope.credentials.username
               || !$scope.credentials.password) {
                return;
            }
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
                var previewsLocation = base64.decode($stateParams.previewsLocation);
                if (previewsLocation.split("/signin/").length == 1) {
                    window.location.replace(previewsLocation);
                    return;
                }
                $location.path("/");
			}).error(function(response) {
                ActionResultDialogService.showWarningDialog(response.message, $scope);
			});
		};

        $scope.fieldValidationRequired = function (uiActionTriggered, fieldChanged, fieldValue) {
            return (uiActionTriggered || fieldChanged) && !fieldValue;
        }

        $scope.signInFieldValidationRequired = function (fieldChanged, fieldValue) {
            return $scope.fieldValidationRequired($scope.signInTriggered, fieldChanged, fieldValue);
        }

        $scope.signUpFieldValidationRequired = function (fieldChanged, fieldValue) {
            return $scope.fieldValidationRequired($scope.signUpTriggered, fieldChanged, fieldValue);
        }
	}
]);
