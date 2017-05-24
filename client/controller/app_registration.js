/* 
 * register the app to angular,and register mainCtrl controller and services
 */
 //delete chart.js will fix some
 //chat.js still not working, most front end problem solved, attention to apis
"use strict";

(function (angular) {
    var app = angular.module("votingApp", ["ui.router","chart.js",function(){
        //console.log("app reg async");
    }]);
    //console.log("app reg sync");
})(window.angular);



