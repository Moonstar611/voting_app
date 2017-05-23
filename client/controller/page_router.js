/* 
 * provide the function of page state routing
 
 debug: authresolve and $state deleted for debug
 */
"use strict";

(function(angular) {
    var app = angular.module("votingApp");
    app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider, AuthResolve) {
            
                
            $stateProvider
                    .state("pollList", {
                        url: "/poll_list",
                        templateUrl: "/v_a/public/directives/poll_list.html",
                        controller: pollListCtrl
                    });  
                    
            $stateProvider.state("newPoll", {
                        url: "/new_poll",
                        templateUrl: "/v_a/public/templates/new_poll.html",
                        controller: newPollCtrl,
                        resolve: {
                            auth: function (AuthResolve) {
                                return AuthResolve.resolve();
                            }
                        }
                    })
                    .state("myPolls", {
                        url: "/my_polls",
                        templateUrl: "/v_a/public/templates/my_polls.html",
                        controller: myPollCtrl,
                        resolve: {
                            auth: function (AuthResolve) {
                                return AuthResolve.resolve();
                            }
                        }
                    })
                    .state("myVotes", {
                        url: "/my_votes",
                        templateUrl: "/v_a/public/templates/my_votes.html",
                        controller: myVoteCtrl,
                        resolve: {
                            auth: function (AuthResolve) {
                                return AuthResolve.resolve();
                            }
                        }
                    })
                    
                    .state("unauth", {
                        url: "/unauth",
                        templateUrl: "/v_a/public/templates/unauth.html"
                    })
                    .state("showPoll", {
                        url: "/show_poll/:pollId",
                        templateUrl: "/v_a/public/templates/poll_admin.html",
                        controller: pollAdminCtrl,
                        resolve: {
                            checkUser: function ($q, $http) {
                                var deferred = $q.defer();
                                $http.get("/api/voting/checkUser")
                                        .then(function (res) {
                                            //console.log("checkUser", res.data);
                                            deferred.resolve(res.data);
                                        })
                                        .catch(function () {
                                            deferred.reject();
                                        });
                                        
                                return deferred.promise;
                            },
                            sameUser: function ($q, $http, $stateParams) {
                                var deferred = $q.defer();
                                $http.get("/api/voting/sameUser/"+$stateParams.pollId)
                                        .then(function (res) {
                                            deferred.resolve(res.data);
                                        })
                                        .catch(function () {
                                            deferred.reject();
                                        });
                                return deferred.promise;
                            }
                        }
                    });
            $urlRouterProvider.when("/unauth", "/unauth");
            $urlRouterProvider.otherwise("/poll_list");
            console.log("router async");
        }]);
        

    function myPollCtrl($http, Session, $scope, auth, $location) { //???!!!!!!!!!!!
        if (auth == null) {
            console.log("Unauthorized user");
            $location.path("/voting_app/unauth");
            return;
        }
        var user = Session.getUser();
        if( user==null){
            $scope.showErr = true;
            $scope.errInfo = "Fail to acquire user information, please refresh";
            return;
        }
        
        $scope.user = user;
        $http.get("/api/voting/users/" + user.twitter.userId + "/polls")
                .then(function (res) {
                    console.log(res.data);
                    $scope.polls = res.data;
                })
                .catch(function (err) {
                    throw err;
                });
    }
    
    function myVoteCtrl($http, Session, $scope, auth, $location) {
        if (auth == null) {
            console.log("Unauthorized user");
            $location.path("/voting_app/unauth");
            return;
        }
        var user = Session.getUser();
        if( user==null){
            $scope.showErr = true;
            $scope.errInfo = "Fail to acquire user information, please refresh";
            return;
        }
        $scope.user = user;
        $http.get("/api/voting/users/" + user.twitter.userId + "/votes")
                .then(function (res) {
                    console.log(res.data);
                    $scope.polls = res.data;
                })
                .catch(function (err) {
                    throw err;
                });
    }
    
    function pollListCtrl($scope,$http){
        $http.get("/api/voting/polls")
        .then(function(res){
            $scope.polls = res.data;
        })
        .catch(function(err){
            throw err;
        });
    }

    function pollAdminCtrl(ShowSwitch, $scope, $stateParams, $http, Session, $state, checkUser, sameUser) {
        ShowSwitch.getScope().showList = false;
        $scope.showErr = false;
        $scope.selected = false;
        var pollItem;
        console.log("checkUser: ", checkUser);
        console.log("sameUser: ", sameUser);
        $scope.currUser = checkUser;
        if (checkUser == null||sameUser == null) {
            $scope.isSameUser = false;
            if(checkUser!=null){
                
                $scope.isUser = true;
            }else if(checkUser==null){
                $scope.isUser = false;
            }
            /*console.log("CurrentUser ID ",currUserId);*/
        } else {
            $scope.isUser = true;
            $scope.isSameUser = true;
        }
        console.log("is user? ", $scope.isUser);
        console.log("same user? ", $scope.isSameUser);
        $http.get("/api/voting/polls/" + $stateParams.pollId)
                .then(function (res) {
                    console.log("respond receiver: ",res);
                    $scope.poll = res.data[0];
                    $scope.pollOptions = Object.keys(res.data[0].pollOptions);
                    pollItem = res.data[0];
                    drawPie(pollItem, $scope);
                })
                .catch(function (err) {
                    throw err;
                });
        $scope.submitOption = function () {
            if ($scope.selectOption == null || $scope.selectOption.length == 0) {
                $scope.showErr = true;
                $scope.errInfo = "please choose one option!";
                return;
            }
            if ($scope.selected) {
                $scope.showErr = true;
                $scope.errInfo = "You already selected one, you can not select multiple times";
                return;
            }
            $scope.selected = true;
            $scope.showErr = false;
            var findObj = {
                "pollId": $stateParams.pollId,
                "selectOption": $scope.selectOption,
                "userId": $scope.isUser? $scope.currUser.twitter.userId : "participants"
            };

            $http.put("/api/voting/polls/" + $stateParams.pollId, findObj)
                    .then(function (res) {
                        console.log(res.data);
                        if (res.data == "Err") {
                            $scope.showErr = true;
                            console.log("error");
                            $scope.errInfo = "Your vote has been recorded, you can not vote again";
                            return;
                        }
                        pollItem.pollOptions[$scope.selectOption]++;
                        $scope.showErr = true;
                        $scope.errInfo = "Your vote has been recorded!";
                        drawPie(pollItem, $scope);
                    })
                    .catch(function (err) {
                        throw err;
                    });
        };
        $scope.deletePoll = function () {
            $http.delete("/api/voting/polls/" + $stateParams.pollId)
                    .then(function (res) {
                        console.log("leave");
                        $state.go("pollList");
                    })
                    .catch(function (err) {
                        throw err;
                    });
        };
    }

    function drawPie(poll, scope) {
        console.log(poll.pollId);
        scope.chartLabels = Object.keys(poll.pollOptions);
        scope.chartData = [];
        scope.chartLabels.forEach(function (key) {
            scope.chartData.push(poll.pollOptions[key]);
        });
    }

    function newPollCtrl($scope, $http, $location, Session, ShowSwitch, auth, $state) {
        if (auth == null) {
            console.log("Unauthorized user");
            $location.path("/voting_app/unauth");
            return;
        }
        ShowSwitch.getScope().showList = false;

        $scope.titleInput = "";
        $scope.optionsInput = "";
        $scope.submitPoll = function () {
            console.log($scope.titleInput, $scope.optionsInput);
            var pollId = "poll" + Date.now();
            var pollObj = {};
            $scope.showErr = false;
            pollObj.pollId = pollId;
            pollObj.pollTitle = $scope.titleInput.replace(/^\s*/, "").replace("/$\s*/", "");
            var temPollOptions = $scope.optionsInput.split(/\n/).map(function (item) {
                item = item.replace(/^\s*/g, "");
                item = item.replace(/\s*$/, "");
                return item;
            }).filter(function (item) {
                return item.length != 0;
            });
            pollObj.pollOptions = {};
            temPollOptions.forEach(function (item) {
                pollObj.pollOptions[item] = 0;
            });

            if (pollObj.pollTitle.length == 0 || temPollOptions.length < 2) {
                $scope.showErr = true;
                return;
            }
            $scope.showErr = false;
            pollObj.userId = Session.getUser().twitter.userId;

            $http.post("/api/voting/polls/" + pollId, pollObj)
                    .then(function (result) {
                        $state.go("showPoll", {"pollId": pollId});
                    })
                    .catch(function (err) {
                        throw err;
                    });
        };
    }
    console.log("router sync");
})(window.angular);


