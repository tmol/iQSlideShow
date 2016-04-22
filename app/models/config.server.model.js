/*global require, exports*/
/*jslint es5: true */
(function () {
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        ConfigSchema = new Schema({
            userSelectedSlideShowsPlayTimeInMinutes: {
                type: Number,
                default: 1,
                required: 'Please fill the user selected slide shows play time in minutes'
            },
            nrOfMinutesAfterLastHealthReportToConsiderDeviceUnheathy: {
                type: Number,
                default: 1,
                required: 'Please fill the number of minutes after last health report to consider device unheathy'
            },
            defaultSlideShowId: {
                type: Schema.ObjectId,
                default: null
            },
            sizeOfAutocompleteListForTags: {
                type: Number,
                default: 100
            },
            defaultSlideDuration: {
                type: Number,
                default: 3
            },
            defaultAnimationType: {
                type: String
            },
            created: {
                type: Date,
                default: Date.now
            },
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            }
        }, {collection: 'config'});

    mongoose.model('Config', ConfigSchema);
}());
