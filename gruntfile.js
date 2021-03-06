'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);

	// Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
		clientViews: ['public/modules/**/views/**/*.html'],
		clientJS: ['public/js/*.js', 'public/modules/**/*.js', '!public/modules/slideshows/slideTemplates/Pdf/pdf*.js'],
		clientCSS: ['public/modules/**/*.css'],
        clientSCSS: ['public/modules/**/*.scss'],
		mochaTests: ['app/tests/**/*.js']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientSCSS: {
				files: watchFiles.clientSCSS,
				tasks: ['sass'],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: true
				}
			}
		},
        sass: {
            options: {
            },
            dist: {
                files: [{
                    expand: true,
                    src: watchFiles.clientSCSS,
                    ext: '.css'
                }]
            }
        },
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		uglify: {
			production: {
				options: {
					mangle: false,
                    screwIE8: true
				},
				files: {
					'public/dist/js/admin.min.js': 'public/dist/js/admin.js',
                    'public/dist/js/player.min.js': 'public/dist/js/player.js'
				}
			}
		},
        concat: {
            production: {
                options: {
                    stripBanners: true
                },
                files: {
                    'public/dist/js/admin.js': '<%= allAdminJavaScriptFiles %>',
                    'public/dist/js/player.js': '<%= allPlayerJavaScriptFiles %>'
                }
            }
        },
		cssmin: {
			combine: {
				files: {
					'public/dist/css/admin.min.css': '<%= allAdminCssFiles %>',
                    'public/dist/css/player.min.css': '<%= allPlayerCssFiles %>'
				}
			}
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--debug'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS)
				}
			}
		},
		'node-inspector': {
			custom: {
				options: {
					'web-port': 1337,
					'web-host': 'localhost',
					'debug-port': 5858,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 50,
					'hidden': []
				}
			}
		},
		ngAnnotate: {
			production: {
				files: {
				}
			}
		},
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch', 'node-inspector'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			},
			secure: {
				NODE_ENV: 'secure'
			},
			build: {
				NODE_ENV: 'build'
			}
		},
		mochaTest: {
			src: watchFiles.mochaTests,
			options: {
				reporter: 'spec',
				require: 'server.js'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);

	// Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function () {
		var init = require('./config/init')();
		var config = require('./config/config');

        console.log('config.assets.allAdminJs: ' + config.assets.allAdminJs);
        console.log('config.assets.allPlayerJs: ' + config.assets.allPlayerJs);
		grunt.config.set('allAdminJavaScriptFiles', config.assets.allAdminJs);
		grunt.config.set('allAdminCssFiles', config.assets.allAdminCss);
		grunt.config.set('allPlayerJavaScriptFiles', config.assets.allPlayerJs);
		grunt.config.set('allPlayerCssFiles', config.assets.allPlayerCss);
	});

	// Default task(s).
	grunt.registerTask('default', ['lint', 'concurrent:default']);

	// Debug task.
	grunt.registerTask('debug', ['lint', 'concurrent:debug']);

	// Secure task(s).
	grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s).
	grunt.registerTask('build', ['env:build', 'loadConfig', 'concat', 'uglify', 'sass', 'cssmin']);

	// Test task.
	grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);

    grunt.loadNpmTasks('grunt-newer');
};
