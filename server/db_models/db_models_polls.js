/* 
 * database model for polls
 */

"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var pollSchema = new Schema({
    pollId:String,
    pollTitle:String,
    userId: String,
    pollOptions: Object,
    votedUsers: Array
});

module.exports = mongoose.model("Poll", pollSchema);

