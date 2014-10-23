/* jslint node: true */
'use strict';
var di = require('di');
var angular = require('angular');
require('angular-animate');
require('angular-aria');
require('angular-file-upload-shim');
require('angular-file-upload');
require('angular-maps-directive');
require('angular-maps-lodash');
require('angular-material');
require('angular-resource');
require('angular-route');

var app = angular.module('krop', [
    'angularFileUpload',
    'google-maps',
    'ngAnimate',
    'ngMaterial',
    'ngResource',
    'ngRoute',
    'services.Base64'
  ]);

app.config( config );

config.$inject = ['$routeProvider'];
function config ( routeProvider ) {
  routeProvider.otherwise( {
    redirectTo : '/'
  });
}

var uiModules = {
  angular   : [ 'value', angular ],
  app       : [ 'value', app ]
};

uiModules.uiModules = [ 'value', uiModules ];

var injector = new di.Injector([uiModules]);

/* modules browserify */
