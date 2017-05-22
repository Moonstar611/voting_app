/* 
 * Configure the user authorization
 */
"use strict";

module.exports = {
    "twitter": {
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        callbackURL: "https://heroku-cli-moonstar611.c9users.io/voting_app/auth/twitter/callback"
    }
    
};


