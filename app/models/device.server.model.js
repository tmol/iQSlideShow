/*global require*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        messagingEngineFactory = require('../services/messaging/messagingEngineFactory'),
        messagingEngine = messagingEngineFactory.init(),
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
            },
            isNewDevice: {
                type: Boolean,
                default: true
            }            
        });
    DeviceSchema.methods.sendMessage = function (message, content) {
        messagingEngine.publish({
            action: message,
            deviceId: this.deviceId,
            content: content || this
        });
    };
    mongoose.model('Device', DeviceSchema);
}());