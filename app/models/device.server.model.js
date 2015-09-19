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
        PlayListEntry = new Schema({
            slideShow : {
                type: Schema.ObjectId,
                ref: 'Slideshow'
            }
        }),
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
            },
            slideAgregation : {
                agregationMode : String,
                playList : [PlayListEntry]
            }
        });

    DeviceSchema.methods.sendDeviceSetupMessage = function (content) {
        messagingEngine.publishToDeviceChannel(this.deviceId, {
            action: 'deviceSetup',
            device: this,
            content: content
        });
    };

    DeviceSchema.methods.sendDeviceSetupMessageWithSlideShowIdToPlay = function (slideShowIdToPlay) {
        this.sendDeviceSetupMessage(
            { slideShowIdToPlay: slideShowIdToPlay }
        );
    };

    mongoose.model('Device', DeviceSchema);
}());
