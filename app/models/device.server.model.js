/*jslint nomen: true, vars: true, unparam: true*/
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
            reloadRequested: {
                type: Date,
                default: null
            },
            lastHealthReport: {
                type: Date,
                default: null
            },
            slideAgregation : {
                agregationMode : {type : String, enum : [playListFactory.getSupportedAgregations()]},
                playList : [PlayListEntry]
            }
        });

    DeviceSchema.methods.getSlides = function () {
        var playList = playListFactory.getPlayList(this.slideAgregation.agregationMode || 'sequential');
        var slides = playList.getSlides(this.slideAgregation.playList);
        return slides;
    };

    DeviceSchema.methods.getDeviceSetupMessage = function (content, callback) {
        return {
            action: 'deviceSetup',
            device: this,
            content: content
        };
    };

    DeviceSchema.methods.getReloadMessage = function (callback) {
        return {
            action: 'reload'
        };
    };

    DeviceSchema.methods.sendDeviceSetupMessage = function (content, callback) {
        messagingEngine.publishToDeviceChannel(this.deviceId, this.getDeviceSetupMessage(), callback);
    };

    DeviceSchema.methods.sendReloadMessage = function (callback) {
        messagingEngine.publishToDeviceChannel(this.deviceId, this.getReloadMessage(), callback);
    };

    DeviceSchema.statics.byId = function (id) {
        return this.findOne({"deviceId": id}).populate('user').populate('slideAgregation.playList.slideShow', 'name');
    };

    DeviceSchema.statics.findByFilter = function (filter, onSuccess, onError) {
        var select = {},
            locationsFilter,
            nameFilter;

        if (filter.locations) {
            locationsFilter = filter.locations;
            if (locationsFilter && locationsFilter.length > 0) {
                if (!(locationsFilter instanceof Array)) {
                    locationsFilter = [locationsFilter];
                }
                select.location = { $in : locationsFilter };
            }
        }

        if (filter.name) {
            nameFilter = filter.name;
            if (nameFilter && nameFilter.length > 0) {
                var getNameFilterExpression = function (nameFilter) {
                    return { $regex: '^' + nameFilter, $options: 'i' };
                };
                select.name =  getNameFilterExpression(nameFilter);
            }
        }

        this.find(select).sort('-created').populate('user', 'displayName').exec(function (err, devices) {
            if (err) {
                onError(err);
            } else {
                onSuccess(devices);
            }
        });
    };

    mongoose.model('Device', DeviceSchema);
}());
