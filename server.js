/*global exports, require, module, console*/
(function () {
    'use strict';
    /**
     * Module dependencies.
     */
    var init = require('./config/init')(),
        config = require('./config/config'),
        mongoose = require('mongoose'),
        chalk = require('chalk'),
        messageHandler = require('./app/services/messaging/messageHandler'),

    /**
     * Main application entry file.
     * Please note that the order of loading is important.
     */

        // Bootstrap db connection
        db = mongoose.connect(config.db, function (err) {
            if (err) {
                console.error(chalk.red('Could not connect to MongoDB!'));
                console.log(chalk.red(err));
            }
        }),
        // Init the express application
        app = require('./config/express')(db);

    messageHandler.init();

    // Bootstrap passport config
    require('./config/passport')();

    // Start the app by listening on <port>
    app.listen(config.port);

    // Expose app
    exports = module.exports = app;

    // Logging initialization
    console.log('MEAN.JS application started on port ' + config.port);
}());