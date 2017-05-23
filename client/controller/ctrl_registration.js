"use strict";

(function(angular){
    var app = angular.module("votingApp");
    app.controller("mainCtrl", /*["$scope", "$http", "Session", "AuthResolve", "ShowSwitch", */function ($scope, $http, Session/*, AuthResolve*/, ShowSwitch) {
                    
                    $scope.showList = true;
                    console.log(Session);
                    ShowSwitch.updateScope($scope);
                    console.log("Ctrl async");
                }/*]*/);
                console.log("ctrl sync");
})(window.angular);
