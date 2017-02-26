var myApp = angular.module('myApp', [
        'ngRoute'
      ]);
      
myApp.config(function($routeProvider) {
      $routeProvider.when('/', {
        templateUrl : "Script/View/MapView.Html",
        controller : "mapViewCtrl"
      }).when("/map", {
        templateUrl : "Script/View/MapView.Html",
        controller : "mapViewCtrl"
    });
      // ...
  });