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
            return res.json(result);
        });
    };
    
    this.getUserPolls = function(req, res, next){ //OK
        
        users.findOne({"twitter.userId": req.params.userId}, function(err, user){
            if(err){
                throw err;
            }
            //////console.log(user);
            var rtPolls = [];
            findUserPolls(0, user.twitter.polls, rtPolls, function(){
                return res.json(rtPolls);
            });
        });
    };
    
    this.getUserVotes = function(req, res, next){ //OK
        
        users.findOne({"twitter.userId": req.params.userId}, function(err, user){
            if(err){
                throw err;
            }
            //////console.log(user);
            var rtVotes = [];
            findUserVotes(0, user.twitter.votedPolls, rtVotes, function(){
                return res.json(rtVotes);
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
            //recorded this poll in     user's votedPolls
                users.update({"twitter.userId": req.body.userId}, {$push:{"twitter.votedPolls": req.body.pollId}}, function(err, result){
                if(err){
                    throw err;
                }
                return;
            });
                
            }else{
                ////console.log("a participants has voted");
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
        ////console.log("newpoll req: ", req.body);
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
            var pollOwnerId = poll.userId;
            //remove this poll from owner's USER document
            
            polls.remove({"pollId": req.params.pollId}, function(err, result){
                if(err){
                    throw err;
                }
                removePollFromOwner(pollOwnerId,req.params.pollId);
                removePollFromUser(0, votedUsers, req.params.pollId);
                return res.send("done");
            });
        });
    };
    
    this.checkSameUser = function(req,res,next){
        if(req.user==null) return res.json(null);
        var reqPollId = req.params.pollId;
        var reqUserId = req.user.twitter.userId;
        ////console.log("reqPollId: ", req.params.pollId);
        ////console.log("reqUserId: ", req.user.twitter.userId);
        polls.findOne({"pollId": reqPollId}, function(err, poll){
            if(err){
                throw err;
            }
            ////console.log("return userId:", poll.userId);
            if(poll.userId==reqUserId){
                res.json(req.user);
            }else{
                res.json(null);
            }
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
            //////console.log(rt);
            findUserPolls(i+1, pollIds, rt, callback);
        });
    }
    
    function findUserVotes(i, votedPollIds, rt, callback){
        if(i==votedPollIds.length){
            callback();
            return;
        }
        
        polls.findOne({"pollId": votedPollIds[i]}, function(err, poll){
            if(err){
                throw err;
            }
            rt.push(poll);
            //////console.log(rt);
            findUserVotes(i+1, votedPollIds, rt, callback);
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
            var newVotedArr = user.twitter.votedPolls.filter(function(pid){
                if(pid!=pollId){
                    return true;
                }
                return false;
            });
            users.update({"twitter.userId": votedUsers[i]}, {"twitter.votedPolls": newVotedArr},function(err, result){
                if(err){
                    throw err;
                }
                removePollFromUser(i+1, votedUsers, pollId);
            });
        });
    }
    
    function removePollFromOwner(pollOwnerId,pollId){
        users.findOne({"twitter.userId": pollOwnerId}, function(err, user){
            if(err){
                return err;
            }
            var newPollArr = user.twitter.polls.filter(function(pid){
                if(pid!=pollId){
                    return true;
                }
                return false;
            });
            users.update({"twitter.userId": pollOwnerId}, {"twitter.polls": newPollArr}, function(err, result){
                if(err){
                    return err;
                }
                return;
            });
        });
    }
    
    
    
    
    
    
};
