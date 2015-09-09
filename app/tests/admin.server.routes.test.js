/*global require, exports, describe, beforeEach, it, afterEach*/
/*jslint es5: true */
/*jslint nomen: true*/
(function () {
    'use strict';

    var should = require('should'),
        request = require('supertest'),
        app = require('../../server'),
        mongoose = require('mongoose'),
        User = mongoose.model('User'),
        Admin = mongoose.model('Admin'),
        agent = request.agent(app),
        credentials,
        user,
        admin;

    /**
     * Admin routes tests
     */
    describe('Admin CRUD tests', function () {
        beforeEach(function (done) {
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

            // Save a user to the test db and create new Admin
            user.save(function () {
                admin = {
                    name: 'Admin Name'
                };

                done();
            });
        });

        it('should be able to save Admin instance if logged in', function (done) {
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) {
                        done(signinErr);
                    }

                    // Get the userId
                    var userId = user.id;

                    // Save a new Admin
                    agent.post('/admin')
                        .send(admin)
                        .expect(200)
                        .end(function (adminSaveErr, adminSaveRes) {
                            // Handle Admin save error
                            if (adminSaveErr) {
                                done(adminSaveErr);
                            }

                            // Get a list of Admins
                            agent.get('/admins')
                                .end(function (adminsGetErr, adminsGetRes) {
                                    // Handle Admin save error
                                    if (adminsGetErr) {
                                        done(adminsGetErr);
                                    }

                                    // Get Admins list
                                    var admins = adminsGetRes.body;

                                    // Set assertions
                                    (admins[0].user._id).should.equal(userId);
                                    (admins[0].name).should.match('Admin Name');

                                    // Call the assertion callback
                                    done();
                                });
                        });
                });
        });

        it('should not be able to save Admin instance if not logged in', function (done) {
            agent.post('/admins')
                .send(admin)
                .expect(401)
                .end(function (adminSaveErr, adminSaveRes) {
                    // Call the assertion callback
                    done(adminSaveErr);
                });
        });

        it('should not be able to save Admin instance if no name is provided', function (done) {
            // Invalidate name field
            admin.name = '';

            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) {
                        done(signinErr);
                    }

                    // Get the userId
                    var userId = user.id;

                    // Save a new Admin
                    agent.post('/admins')
                        .send(admin)
                        .expect(400)
                        .end(function (adminSaveErr, adminSaveRes) {
                            // Set message assertion
                            (adminSaveRes.body.message).should.match('Please fill Admin name');

                            // Handle Admin save error
                            done(adminSaveErr);
                        });
                });
        });

        it('should be able to update Admin instance if signed in', function (done) {
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) {
                        done(signinErr);
                    }

                    // Get the userId
                    var userId = user.id;

                    // Save a new Admin
                    agent.post('/admins')
                        .send(admin)
                        .expect(200)
                        .end(function (adminSaveErr, adminSaveRes) {
                            // Handle Admin save error
                            if (adminSaveErr) {
                                done(adminSaveErr);
                            }

                            // Update Admin name
                            admin.name = 'WHY YOU GOTTA BE SO MEAN?';

                            // Update existing Admin
                            agent.put('/admins/' + adminSaveRes.body._id)
                                .send(admin)
                                .expect(200)
                                .end(function (adminUpdateErr, adminUpdateRes) {
                                    // Handle Admin update error
                                    if (adminUpdateErr) {
                                        done(adminUpdateErr);
                                    }

                                    // Set assertions
                                    (adminUpdateRes.body._id).should.equal(adminSaveRes.body._id);
                                    (adminUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                                    // Call the assertion callback
                                    done();
                                });
                        });
                });
        });

        it('should be able to get a list of Admins if not signed in', function (done) {
            // Create new Admin model instance
            var adminObj = new Admin(admin);

            // Save the Admin
            adminObj.save(function () {
                // Request Admins
                request(app).get('/admins')
                    .end(function (req, res) {
                        // Set assertion
                        res.body.should.be.an.Array.with.lengthOf(1);

                        // Call the assertion callback
                        done();
                    });

            });
        });


        it('should be able to get a single Admin if not signed in', function (done) {
            // Create new Admin model instance
            var adminObj = new Admin(admin);

            // Save the Admin
            adminObj.save(function () {
                request(app).get('/admins/' + adminObj._id)
                    .end(function (req, res) {
                        // Set assertion
                        res.body.should.be.an.Object.with.property('name', admin.name);

                        // Call the assertion callback
                        done();
                    });
            });
        });

        it('should be able to delete Admin instance if signed in', function (done) {
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) {
                        done(signinErr);
                    }

                    // Get the userId
                    var userId = user.id;

                    // Save a new Admin
                    agent.post('/admins')
                        .send(admin)
                        .expect(200)
                        .end(function (adminSaveErr, adminSaveRes) {
                            // Handle Admin save error
                            if (adminSaveErr) {
                                done(adminSaveErr);
                            }

                            // Delete existing Admin
                            agent.delete('/admins/' + adminSaveRes.body._id)
                                .send(admin)
                                .expect(200)
                                .end(function (adminDeleteErr, adminDeleteRes) {
                                    // Handle Admin error error
                                    if (adminDeleteErr) {
                                        done(adminDeleteErr);
                                    }

                                    // Set assertions
                                    (adminDeleteRes.body._id).should.equal(adminSaveRes.body._id);

                                    // Call the assertion callback
                                    done();
                                });
                        });
                });
        });

        it('should not be able to delete Admin instance if not signed in', function (done) {
            // Set Admin user
            admin.user = user;

            // Create new Admin model instance
            var adminObj = new Admin(admin);

            // Save the Admin
            adminObj.save(function () {
                // Try deleting Admin
                request(app).delete('/admins/' + adminObj._id)
                    .expect(401)
                    .end(function (adminDeleteErr, adminDeleteRes) {
                        // Set message assertion
                        (adminDeleteRes.body.message).should.match('User is not logged in');

                        // Handle Admin error error
                        done(adminDeleteErr);
                    });

            });
        });

        afterEach(function (done) {
            User.remove().exec();
            Admin.remove().exec();
            done();
        });
    });
}());