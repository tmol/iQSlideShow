/*jslint nomen: true, vars: true, unparam: true*/
/*global require, exports*/
(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        TagSchema = new Schema({
            value: {
                type: String,
                default: 1,
                index: 1
            }
        }, {collection: 'tags'});

    TagSchema.statics.addTag = function (value, resolve, reject) {
        var Tag = mongoose.model("Tag");

        //if no tag is found, than insert the new one
        Tag.findOne({value: value}, function (err, existingTag) {

            if (err) {
                reject(err);
                return;
            }
            if (existingTag) {
                resolve(value);
                return;
            }

            var tag = new Tag({value: value});
            tag.save(function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(value);
            });
        });
    };

    mongoose.model('Tag', TagSchema);
    module.exports = mongoose.model('Tag');
}());
