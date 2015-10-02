/*global require, exports*/
/*jslint es5: true */
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        LocationSchema = new Schema({
            name: {
                type: String,
                default: '',
                required: 'Please fill the user selected slide shows play time in minutes'
            }
        }, {collection: 'location'});

    mongoose.model('Location', LocationSchema);
}());