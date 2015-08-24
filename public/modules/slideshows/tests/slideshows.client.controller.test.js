/*jslint nomen: true, vars: true*/
/*global describe, jasmine, angular, beforeEach, module, ApplicationConfiguration, inject, it, expect*/
(function () {
    'use strict';
	// Slideshows Controller Spec
	describe('Slideshows Controller Tests', function () {
		// Initialize global variables
		var SlideshowsController, scope, $httpBackend, $stateParams, $location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function () {
			jasmine.addMatchers({
				toEqualData: function (util, customEqualityTesters) {
					return {
						compare: function (actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Slideshows controller.
			SlideshowsController = $controller('SlideshowsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Slideshow object fetched from XHR', inject(function (Slideshows) {
			// Create sample Slideshow using the Slideshows service
			var sampleSlideshow = new Slideshows({
				name: 'New Slideshow'
			});

			// Create a sample Slideshows array that includes the new Slideshow
			var sampleSlideshows = [sampleSlideshow];

			// Set GET response
			$httpBackend.expectGET('slideshows').respond(sampleSlideshows);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.slideshows).toEqualData(sampleSlideshows);
		}));

		it('$scope.findOne() should create an array with one Slideshow object fetched from XHR using a slideshowId URL parameter', inject(function (Slideshows) {
			// Define a sample Slideshow object
			var sampleSlideshow = new Slideshows({
				name: 'New Slideshow'
			});

			// Set the URL parameter
			$stateParams.slideshowId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/slideshows\/([0-9a-fA-F]{24})$/).respond(sampleSlideshow);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.slideshow).toEqualData(sampleSlideshow);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function (Slideshows) {
			// Create a sample Slideshow object
			var sampleSlideshowPostData = new Slideshows({
				name: 'New Slideshow'
			});

			// Create a sample Slideshow response
			var sampleSlideshowResponse = new Slideshows({
				_id: '525cf20451979dea2c000001',
				name: 'New Slideshow'
			});

			// Fixture mock form input values
			scope.name = 'New Slideshow';

			// Set POST response
			$httpBackend.expectPOST('slideshows', sampleSlideshowPostData).respond(sampleSlideshowResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Slideshow was created
			expect($location.path()).toBe('/slideshows/' + sampleSlideshowResponse._id);
		}));

		it('$scope.update() should update a valid Slideshow', inject(function (Slideshows) {
			// Define a sample Slideshow put data
			var sampleSlideshowPutData = new Slideshows({
				_id: '525cf20451979dea2c000001',
				name: 'New Slideshow'
			});

			// Mock Slideshow in scope
			scope.slideshow = sampleSlideshowPutData;

			// Set PUT response
			$httpBackend.expectPUT(/slideshows\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/slideshows/' + sampleSlideshowPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid slideshowId and remove the Slideshow from the scope', inject(function (Slideshows) {
			// Create new Slideshow object
			var sampleSlideshow = new Slideshows({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Slideshows array and include the Slideshow
			scope.slideshows = [sampleSlideshow];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/slideshows\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSlideshow);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.slideshows.length).toBe(0);
		}));
	});
}());
