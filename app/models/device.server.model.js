/*global require*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        DeviceSchema = new Schema({
            name: {
                type: String,
                default: '',
                required: 'Please fill Device name',
                trim: true
            },
            deviceId: {
                type: String,
                default: '',
                required: 'Please fill Device Id',
                trim: true,
                unique: true
            },
            location: {
                type: String,
                default: '',
                required: 'Please fill Device location',
                trim: true
            },
            defaultSlideShowId: {
                type: Schema.ObjectId,
                ref: 'Slideshow'
            },
            active: {
                type: Boolean,
                default: false
            },
            created: {
                type: Date,
                default: Date.now
            },
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            }
        });

    mongoose.model('Device', DeviceSchema);
}());