'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Slideshow = mongoose.model('Slideshow'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, slideshow;

/**
 * Slideshow routes tests
 */
describe('Slideshow CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Slideshow
		user.save(function() {
			slideshow = {
				name: 'Slideshow Name'
			};

			done();
		});
	});

	it('should be able to save Slideshow instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Slideshow
				agent.post('/slideshows')
					.send(slideshow)
					.expect(200)
					.end(function(slideshowSaveErr, slideshowSaveRes) {
						// Handle Slideshow save error
						if (slideshowSaveErr) done(slideshowSaveErr);

						// Get a list of Slideshows
						agent.get('/slideshows')
							.end(function(slideshowsGetErr, slideshowsGetRes) {
								// Handle Slideshow save error
								if (slideshowsGetErr) done(slideshowsGetErr);

								// Get Slideshows list
								var slideshows = slideshowsGetRes.body;

								// Set assertions
								(slideshows[0].user._id).should.equal(userId);
								(slideshows[0].name).should.match('Slideshow Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Slideshow instance if not logged in', function(done) {
		agent.post('/slideshows')
			.send(slideshow)
			.expect(401)
			.end(function(slideshowSaveErr, slideshowSaveRes) {
				// Call the assertion callback
				done(slideshowSaveErr);
			});
	});

	it('should not be able to save Slideshow instance if no name is provided', function(done) {
		// Invalidate name field
		slideshow.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Slideshow
				agent.post('/slideshows')
					.send(slideshow)
					.expect(400)
					.end(function(slideshowSaveErr, slideshowSaveRes) {
						// Set message assertion
						(slideshowSaveRes.body.message).should.match('Please fill Slideshow name');
						
						// Handle Slideshow save error
						done(slideshowSaveErr);
					});
			});
	});

	it('should be able to update Slideshow instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Slideshow
				agent.post('/slideshows')
					.send(slideshow)
					.expect(200)
					.end(function(slideshowSaveErr, slideshowSaveRes) {
						// Handle Slideshow save error
						if (slideshowSaveErr) done(slideshowSaveErr);

						// Update Slideshow name
						slideshow.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Slideshow
						agent.put('/slideshows/' + slideshowSaveRes.body._id)
							.send(slideshow)
							.expect(200)
							.end(function(slideshowUpdateErr, slideshowUpdateRes) {
								// Handle Slideshow update error
								if (slideshowUpdateErr) done(slideshowUpdateErr);

								// Set assertions
								(slideshowUpdateRes.body._id).should.equal(slideshowSaveRes.body._id);
								(slideshowUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Slideshows if not signed in', function(done) {
		// Create new Slideshow model instance
		var slideshowObj = new Slideshow(slideshow);

		// Save the Slideshow
		slideshowObj.save(function() {
			// Request Slideshows
			request(app).get('/slideshows')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Slideshow if not signed in', function(done) {
		// Create new Slideshow model instance
		var slideshowObj = new Slideshow(slideshow);

		// Save the Slideshow
		slideshowObj.save(function() {
			request(app).get('/slideshows/' + slideshowObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', slideshow.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Slideshow instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Slideshow
				agent.post('/slideshows')
					.send(slideshow)
					.expect(200)
					.end(function(slideshowSaveErr, slideshowSaveRes) {
						// Handle Slideshow save error
						if (slideshowSaveErr) done(slideshowSaveErr);

						// Delete existing Slideshow
						agent.delete('/slideshows/' + slideshowSaveRes.body._id)
							.send(slideshow)
							.expect(200)
							.end(function(slideshowDeleteErr, slideshowDeleteRes) {
								// Handle Slideshow error error
								if (slideshowDeleteErr) done(slideshowDeleteErr);

								// Set assertions
								(slideshowDeleteRes.body._id).should.equal(slideshowSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Slideshow instance if not signed in', function(done) {
		// Set Slideshow user 
		slideshow.user = user;

		// Create new Slideshow model instance
		var slideshowObj = new Slideshow(slideshow);

		// Save the Slideshow
		slideshowObj.save(function() {
			// Try deleting Slideshow
			request(app).delete('/slideshows/' + slideshowObj._id)
			.expect(401)
			.end(function(slideshowDeleteErr, slideshowDeleteRes) {
				// Set message assertion
				(slideshowDeleteRes.body.message).should.match('User is not logged in');

				// Handle Slideshow error error
				done(slideshowDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Slideshow.remove().exec();
		done();
	});
});