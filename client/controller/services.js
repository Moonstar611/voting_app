"use strict";

(function(angular){
    angular.module("votingApp").service("Session", function () {
        
                    
                //console.log("service async1");
                var user = null;
                
                this.updateUser = function (input) {
                    user = input;
                    
                };
                this.getUser = function () {
                    //if(user!=null){
                        //$scope.currUser = user;
                   // }
                    return user;
                };
                //console.log("Session registered");
            });  
    angular.module("votingApp").service("AuthResolve", /*["$q", "$http", "$location", "Session", */function ($q, $http, $location, Session) {
                //console.log("dafads");
                    
                       this.resolve = function() {
                    var deferred = $q.defer();
                    $http.get("/api/voting/checkUser")
                            .then(function (res) {
                                if (res.data != null) {
                                    $http.get("api/voting/user")
                                            .then(function (res) {
                                                Session.updateUser(res.data);
                                                deferred.resolve(res.data);
                                            })
                                            .catch(function () {
                                                deferred.reject();
                                            });
                                } else {
                                    deferred.resolve(null);
                                }
                            })
                            .catch(function (err) {
                                deferred.reject();
                                
                                //console.log(err);
                                $location.path = "/voting_app/logout";
                                throw err;
                            });
                            //console.log("service async2");
                    return deferred.promise;
                    
                };
                    
               
            }/*]*/);
            
    angular.module("votingApp").service("ShowSwitch", function () {
                var topScope;
                this.updateScope = function (ele) {
                    topScope = ele;
                };
                this.getScope = function () {
                    return topScope;
                };
                //console.log("service async3");
            });
            //console.log("services sync");
})(window.angular);


            
            