/*global require, exports*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        mongooseCsv = require('mongoose-csv'),
        Schema = mongoose.Schema,
        AuditSchema = new Schema({
            deviceId: {
                type: String,
                default: null,
                required: 'Please provide the device id'
            },
            deviceName: {
                type: String,
                default: '',
                required: 'Please provide the device name'
            },
            location: {
                type: String,
                default: '',
                required: 'Please provide the location'
            },
            action: {
                type: String,
                default: '',
                required: 'Please provide the action'
            },
            context: {
                type: Schema.Types.Mixed
            },
            created: {
                type: Date,
                default: Date.now,
                required: 'Please provide the creation date'
            }
        });
    AuditSchema.plugin(mongooseCsv);
    mongoose.model('Audit', AuditSchema);
}());
