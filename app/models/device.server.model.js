/*global require*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        messagingEngineFactory = require('../services/messaging/messagingEngineFactory'),
        playListFactory = require('../services/playlisting/playListFactory'),
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
                agregationMode : {type : String, enum : [playListFactory.getSupportedAgregations()]},
                playList : [PlayListEntry]
            }
        });

    var getSlides = function (slideAgregation) {
        var playList = playListFactory.getPlayList(slideAgregation.agregationMode || 'sequential');
        return playList.getSlides(slideAgregation.playList);
    };

    DeviceSchema.methods.sendDeviceSetupMessage = function (content) {
        messagingEngine.publishToDeviceChannel(this.deviceId, {
            action: 'deviceSetup',
            device: this,
            slides: getSlides(this.slideAgregation),
            content: content
        });
    };

    DeviceSchema.methods.sendDeviceSetupMessageWithSlideShowIdToPlay = function (slideShowIdToPlay) {
        this.sendDeviceSetupMessage(
            {slides: getSlides(this.slideAgregation)}
        );
    };

    mongoose.model('Device', DeviceSchema);
}());
