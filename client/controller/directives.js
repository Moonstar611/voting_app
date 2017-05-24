"use strict";

(function(angular){
    angular.module("votingApp").directive("myBox", function () {
        //console.log("directives async1");
                return{
                    restrict: "E",
                    transclude: true,
                    scope: {},
                    controller: boxCtrl,
                    templateUrl: "/v_a/public/directives/box.html"
                };
            });
    angular.module("votingApp").directive("myNavbar", function () {
        //console.log("directives async2");
                return{
                    restrict: "E",
                    scope: {},
                    controller: /*["$scope", "Session", "$http", */function ($scope, Session, $http) {
                            $http.get("/api/voting/user")
                                    .then(function (res) {
                                        $scope.user = res.data;
                                        Session.updateUser(res.Data);
                                    });
                        }/*]*/,
                    link: navbarCtrl,
                    templateUrl: "/v_a/public/directives/navbar.html"
                };
            });
    angular.module("votingApp").directive("myPolllist", function () {
        //console.log("directives async3");
                return{
                    restrict: "E",
                    scope: {},
                    require: "^^myBox",
                    link: pollListLink,
                    templateUrl: "/v_a/public/directives/poll_list.html"
                };
            });
    
    function boxCtrl($scope, $http) {
        this.getList = function (ele) {
            $http.get("/api/voting/polls")
                    .then(function (res) {
                        ele.polls = res.data;
                    })
                    .catch(function (err) {
                        throw err;
                    });
        };
    }
    
    function navbarCtrl(scope, ele, attrs, ctrl){
        if(attrs.login=="true"){
            scope.showUser = true;
        }else{
            scope.showUser = false;
        }
    }
    
    function pollListLink(scope, ele, attrs, boxCtrl){
        boxCtrl.getList(scope);
    }
    //console.log("directs sync");
})(window.angular);