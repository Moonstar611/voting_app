/* 
 * server router server the api services
 */
"user strict";

var serverCtrl = require(process.cwd()+"/voting_app/server/server_control.js");

module.exports = function(app, passport){
    var ctrl = new serverCtrl(app);
    
    app.get("/voting_app", isLogin, function(req,res,next){
        return res.sendFile(process.cwd() + "/voting_app/public/index.html");
    });
    
    app.get("/voting_app/login", function(req,res){
        return res.sendFile(process.cwd()+"/voting_app/public/login.html");
    });
    
    app.get("/voting_app/logout", function(req,res){
        req.logout();
        return res.redirect("/voting_app");
    });
    
    app.get("/voting_app/auth/twitter", passport.authenticate("twitter"));
    
    app.get("/voting_app/auth/twitter/callback", passport.authenticate("twitter", {
        successRedirect: "/voting_app",
        failureRedirect: "/voting_app/login"
    }));
    
    /*
    app.get("/auth/twitter/callback", passport.authenticate("twitter", {
        successRedirect : "/",
        failureRedirect : "/check"
    }));
     */
    app.get("/api/voting/polls", ctrl.getAllPolls);
    app.get("/api/voting/polls/:pollId", ctrl.getPoll);
    app.get("/api/voting/users/:userId/polls", isLogin, ctrl.getUserPolls);
    app.get("/api/voting/users/:userId/votes", isLogin, ctrl.getUserVotes);
    app.put("/api/voting/polls/:pollId", ctrl.updatePoll);           //!!!!!!
    app.post("/api/voting/polls/:pollId", isLogin, ctrl.createPoll);//!!!!!!
    app.delete("/api/voting/polls/:pollId", isLogin, ctrl.deletePoll);//!!!!!!
    
    app.get("/api/voting/user", isLogin, ctrl.getUser);
    
    app.get("/api/voting/checkUser", function(req,res){
        //console.log("reqUser: ", req.user);
        if(req.isAuthenticated()){
            return res.json(req.user);
        }else{
            return res.json(null);
        }
    });
    //below check if the current user is the one who created the poll, if not he can not edit the poll
     app.get("/api/voting/sameUser/:pollId", ctrl.checkSameUser);
    
    function isLogin(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }else{
            return res.redirect("/voting_app/login");
        }
    }
    
};


