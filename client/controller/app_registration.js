/* 
 * register the app to angular,and register mainCtrl controller and services
 */
"use strict";

(function (angular) {
    var app = angular.module("votingApp", ["ui.router", "Chart.js"]);
    console.log("p1");
    pageRouter(app);
    app.controller("mainCtrl", ["$scope", "$http", "Session", "ShowSwitch", function ($scope, $http, Session, ShowSwitch) {
        
                    console.log("worinima");
                    $scope.showList = true;
                    console.log(Session);
                    ShowSwitch.updateScope($scope);
                }]);
    console.log("p1");
    console.log("p2");
})(window.angular);



