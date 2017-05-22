/* 
 * configure the passport module
 */
"use strict";

var twitterStrategy = require("passport-twitter").Strategy;
var users = require("../db_models/db_models_users.js");

var authConfig = require(process.cwd() + "/voting_app/server/config/auth.js");

module.exports = function(passport){
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done){
        users.findById(id, function(err, user){
            done(err, user);
        });
    });
    
    passport.use(new twitterStrategy({
        
        consumerKey: authConfig.twitter.consumerKey,
        consumerSecret: authConfig.twitter.consumerSecret,
        callbackURL: authConfig.twitter.callbackURL
    }, function(token, refreshToken, profile, done){
        process.nextTick(function(){
            users.findOne({"twitter,userId": profile.id}, (function(err, user){
                if(err){
                    return done(err);
                }
                if(user){
                    return done(null, user);
                }else{
                    var newUser = new users(); 
                    newUser.twitter.userId = profile.id;
                    newUser.twitter.userName = profile.displayName;
                    newUser.twitter.polls = [];
                    newUser.save(function(err){
                        if(err){
                            throw err;
                        }
                        done(null, newUser);
                    });
                }
            }));
        });
    }));
};


