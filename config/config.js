'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	glob = require('glob');

/**
 * Load app configurations
 */
module.exports = _.extend(
	require('./env/all'),
	require('./env/' + process.env.NODE_ENV) || {}
);

/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			glob(globPatterns, {
				sync: true
			}, function(err, files) {
				if (removeRoot) {
					files = files.map(function(file) {
						return file.replace(removeRoot, '');
					});
				}

				output = _.union(output, files);
			});
		}
	}

	return output;
};

/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function(includeTests) {
    var assets = {};

	assets.appContext = this.getGlobbedFiles(this.assets.lib.js, 'public/');
    assets.appStart = this.getGlobbedFiles(this.assets.js, 'public/');

	// To include tests
	if (includeTests) {
		assets.core = _.union(assets.core, this.getGlobbedFiles(this.assets.tests));
	}

    for (var prop in this.assets.modules) {
        if (!this.assets.modules[prop].js) {
            continue;
        }
        assets[prop] = this.getGlobbedFiles(this.assets.modules[prop].js, 'public/');
    }

	return assets;
};

/**
 * Get the modules CSS files
 */
module.exports.getCSSAssets = function() {
    var assets = {};
	assets.appContext = this.getGlobbedFiles(this.assets.lib.css, 'public/');
    assets.appStart = this.getGlobbedFiles(this.assets.css, 'public/');

    for (var prop in this.assets.modules) {
        if (!this.assets.modules[prop].css) {
            continue;
        }
        assets[prop] = this.getGlobbedFiles(this.assets.modules[prop].css, 'public/');
    }
	return assets;
};
