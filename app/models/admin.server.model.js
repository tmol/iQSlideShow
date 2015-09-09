/*global require, exports*/
/*jslint es5: true */
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        AdminSchema = new Schema({
            userSelectedSlideShowsPlayTimeInMinutes: {
                type: Number,
                default: 1,
                required: 'Please fill the user selected slide shows play time in minutes'
            },
            defaultSlideShowId: {
                type: Schema.ObjectId,
                default: null
            },
            created: {
                type: Date,
                default: Date.now
            },
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            }
        }, {collection: 'admin'});

    mongoose.model('Admin', AdminSchema);
}());