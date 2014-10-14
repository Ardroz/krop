/* jslint node: true */
'use strict';
var di = require('di');
var angular = require('angular');
require('angular-resource');
require('angular-route');
require('bootstrap');
require('angular-bootstrap');
require('ng-tags-input');
require('angular-maps-lodash');
require('angular-maps-directive');
require('angular-file-upload-shim');
require('angular-file-upload');

var app = angular.module('krop', [
      'ngTagsInput',
      'ngRoute',
      'ui.bootstrap',
      'ngResource',
      'google-maps',
      'angularFileUpload',
      'services.Base64'
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
