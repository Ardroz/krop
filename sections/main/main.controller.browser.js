/* jslint node: true */
/* global L */
'use strict';
require('mapbox.js');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope' ];
  function main ( scope ) {
    angular.extend( scope, {
      defaults: {
          tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
          maxZoom: 1000,
          path: {
              weight: 10,
              color: '#800000',
              opacity: 1
          }
      }
    });
  }
};
