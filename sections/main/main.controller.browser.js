/* jslint node: true */
/* global L */
'use strict';
var __ = require('underscore')._;
require('mapbox.js');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope', 'leafletEvents' ];
  function main ( scope, leafletEvents ) {
    scope.status = 'portals';
    scope.pathsCoords = [];

    scope.map = {
      tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxZoom: 1000
    };

    scope.center =  {
      autoDiscover: true
    };

    scope.portals = [];
    scope.temporals = [];

    scope.addPortal = function () {
      var portal = {
        lat: scope.center.lat,
        lng: scope.center.lng,
        message: 'Portal ' + scope.portals.length,
        focus: true,
        draggable: true
      };

      scope.portals.push( portal );
    };

    scope.deletePortal = function ( index ) {
      scope.portals.splice( index, 1 );
    };


    //Troubles getting the portal selected
    scope.$on( 'leafletDirectiveMap.focus', function( event ) {
      switch( scope.status ) {
        case 'links':
          break;
        case 'fields':
          break;
      }
    });
    /*scope.paths = {
      polygon: {
        type: "polygon",
        latlngs: []
      }
    };*/

  }
};
