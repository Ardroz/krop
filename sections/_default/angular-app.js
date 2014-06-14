/* jslint node: true */
'use strict';
var di = require('di');
var angular = require('angular');
require('angular-resource');
require('angular-route');
require('bootstrap');
require('angular-bootstrap');
require('angular-leaflet-directive');

var app = angular.module('krop', [
      'leaflet-directive',
      'ngRoute',
      'ui.bootstrap',
      'ngResource'
    ]);
app.config(function ($routeProvider) {
  $routeProvider.otherwise({redirectTo : '/view1'});
});

var uiModules = {
  angular   : [ 'value', angular ],
  app       : [ 'value', app ]
};
uiModules.uiModules = [ 'value', uiModules ];

var injector = new di.Injector([uiModules]);

/* modules browserify */
