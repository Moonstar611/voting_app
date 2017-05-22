/* 
 * server controller interacting with database
 */

"use strict";

var users = require(process.cwd()+"/voting_app/server/db_models/db_models_users.js");
var polls = require(process.cwd()+"/voting_app/server/db_models/db_models_polls.js");

module.exports = function(app){
    this.getAllPolls = function(req,res,next){
        polls.find({}, function(err, results){
            if(err){
                throw err;
            }
            
            return res.json(results);
        });
    };
    
    this.getUser = function(req,res){
        return res.json(req.user);
    };
    
    this.getPoll = function(req,res,next){
        
        polls.find({"pollId": req.params.pollId}, function(err, result){
            if(err){
                throw err;
            }
            return res.json(req.user);
        });
    };
    
    this.getUserPolls = function(req, res, next){
        
        users.findOne({"twitter.userId": req.params.userId}, function(err, user){
            if(err){
                throw err;
            }
            var rtPolls = [];
            findUserPolls(0, user.twitter.polls, rtPolls, function(){
                return res.json(rtPolls);
            });
        });
    };
    
    this.updatePoll = function(req,res,next){
        polls.findOne({"pollId": req.body.pollId}, function(err, tg){
            if(err){
                throw err;
            }
            tg.pollOptions[req.body.selectOption]++;
            if(tg.votedUsers.indexOf(req.body.userId)!=-1){
                return res.send('Err');
            }
            if(req.body.userId != "participants"){
                tg.votedUsers.push(req.body.userId);
            }else{
                console.log("a participants has voted");
            }
            
            polls.update({"pollId": req.body.pollId}, {
                "pollOptions": tg.pollOptions,
                "votedUsers": tg.votedUsers
            }, function(err, result){
                if(err){
                    throw err;
                }
                        return res.json(tg);
            });
        });
    };
    
    this.createPoll = function(req,res,next){
        var newPoll = new polls();
        newPoll.pollId = req.body.pollId;
        newPoll.pollTitle = req.body.pollTitle;
        newPoll.pollOptions = req.body.pollOptions;
        newPoll.userId = req.body.userId;
        newPoll.votedUsers = [];
        newPoll.save(function(err){
            if(err){
                throw err;
            }
            users.update({"twitter.userId": req.body.userId}, {$push:{"twitter.polls": req.body.pollId}}, function(err, result){
                if(err){
                    throw err;
                }
                return res.json(result);
            });
            
        });
    };
    
    this.deletePoll = function(req, res, next){
        polls.findOne({"pollId": req.params.pollId}, function(err,poll){
            if(err){
                throw err;
            }
            var votedUsers = poll.votedUsers;
            polls.remove({"pollId": req.params.pollId}, function(err, result){
                if(err){
                    throw err;
                }
                removePollFromUser(0, votedUsers, req.params.pollId);
                return res.send("done");
            });
        });
    };
    
    function findUserPolls(i, pollIds, rt, callback){
        if(i==pollIds.length){
            callback();
            return;
        }
        
        polls.findOne({"pollId": pollIds[i]}, function(err, poll){
            if(err){
                throw err;
            }
            rt.push(poll);
            findUserPolls(i+1, pollIds, rt, callback);
        });
    }
    
    function removePollFromUser(i, votedUsers, pollId){
        if(i==votedUsers.length){
            return;
        }
        
        users.findOne({"twitter.userId": votedUsers[i]}, function(err, user){
            if(err){
                return err;
            }
            var newPollArr = user.twitter.polls.filter(function(pid){
                if(pid!=pollId){
                    return true;
                }
                return false;
            });
            user.update({"twitter.userId": votedUsers[i]}, {"twitter.polls": newPollArr},function(err, result){
                if(err){
                    throw err;
                }
                removePollFromUser(i+1, votedUsers, pollId);
            });
        });
    }
    
    
    
};
