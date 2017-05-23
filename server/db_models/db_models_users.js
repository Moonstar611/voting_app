/* 
 * database model for users
 */
"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    twitter: {
        userId: String,
        userName: String,
        polls: [],
        votedPolls: []
    }
});

module.exports = mongoose.model("User", userSchema);


