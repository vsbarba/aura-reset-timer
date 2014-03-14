'use strict';

var App = angular.module('app', ['ngRoute']);

// Routes
App.config(function ($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: '/views/index.html'
    });
});
