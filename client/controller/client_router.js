/* 
 * provide the function of page state routing
 */
"use strict";

function pageRouter(app) {
    console.log("p3");
    app.config(["$stateProvider", "$urlRouterProvider", "AuthResolve", "$state", function ($stateProvider, $urlRouterProvider, $state, AuthResolve) {
            $stateProvider
                    .state("pollList", {
                        url: "/poll_list",
                        templateUrl: "/v_a/public/directives/poll_list.html",
                        controller: pollListCtrl
                    })
                    .state("newPoll", {
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
                                            console.log(res.data);
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
        }]);
        

    function myPollCtrl($http, $state, Session, $scope, auth, $location) {
        if (auth == null) {
            console.log("Unauthorized user");
            $location.path("/voting_app/unauth");
            return;
        }
        $scope.user = Session.getUser();
        $http.get("/api/voting/users" + Session.getUser().twitter.userId + "/polls")
                .then(function (res) {
                    console.log(res.data);
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

    function pollAdminCtrl(ShowSwitch, $scope, $stateParams, $http, $state, Session, checkUser) {
        ShowSwitch.getScope().showList = false;
        $scope.showErr = false;
        $scope.selected = false;
        var pollItem;
        console.log("checkUser: ", checkUser);
        console.log("Session: ", Session.getUser().twitter);
        if (checkUser == null) {
            $scope.isUser = false;
        } else {
            $scope.isUser = true;
        }
        $http.get("/api/voting/polls/" + $stateParams.pollId)
                .then(function (res) {
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
                $scope.errIndo = "You already selected one, you can not select multiple times";
                return;
            }
            $scope.soelected = true;
            $scope.showErr = false;
            var findObj = {
                "pollId": $stateParams.pollId,
                "selectOption": $scope.selectOption,
                "userId": $scope.isUser ? Session.getUser().twitter.userId : "participants"
            };

            $http.put("/api/polls/" + $stateParams.pollId, findObj)
                    .then(function (res) {
                        console.log(res.data);
                        if (res.data == "Err") {
                            $scope.showErr = true;
                            console.log("error");
                            $scope.errInfo = "Your vote has been recorded, you can not vote again";
                            return;
                        }
                        pollItem.pollOptions[$scope.selectOption]++;
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

    function newPollCtrl($scope, $http, $location, Session, ShowSwitch, $state, auth) {
        if (auth == null) {
            console.log("Unauthorized user");
            $location.path("/voting_app/unauth");
            return;
        }
        ShowSwitch.getScope().showList = false;

        $scope.titleInput = "";
        $scope.optionsInput = "";
        $scope.submitPoll = function () {
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
}


