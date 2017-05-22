"use strict";

(function(angular){
    angular.module("votingApp").factory("Session", function () {
                var user = null;
                this.updateUser = function (input) {
                    user = input;
                };
                this.getUser = function () {
                    return user;
                };
            });
    angular.module("votingApp").factory("AuthResolve", ["$q", "$http", "$location", "Session", function ($q, $http, $location, Session) {
                this.resolve = function () {
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
                                console.log(err);
                                $location.path = "/voting_app/logout";
                            });
                    return deferred.promise;
                };
            }]);
    angular.module("votingApp").factory("ShowSwitch", function () {
                var topScope;
                this.updateScope = function (ele) {
                    topScope = ele;
                };
                this.getScope = function () {
                    return topScope;
                };
            });
})(window.angular);


            
            