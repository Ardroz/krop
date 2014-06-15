/* jslint node: true */
/* global L */
'use strict';
var __ = require('underscore')._;
require('mapbox.js');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope', 'leafletEvents' ];
  function main ( scope, leafletEvents ) {
    scope.pathsCoords = [];
    scope.map = {
      tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxZoom: 1000
    };

    scope.center =  {
      autoDiscover: true
    };

    scope.markers = [];

    scope.addMarker = function () {
      var marker = {
        lat: scope.center.lat,
        lng: scope.center.lng,
        message: 'Yolo',
        focus: true,
        draggable: true
      };

      scope.markers.push( marker );
    };

    scope.deleteMarker = function ( index ) {
      scope.markers.splice( index, 1 );
    };



    scope.$on( 'leafletDirectiveMap.popupopen', function( event ) {
      console.log(event);
    });
    /*scope.paths = {
      polygon: {
        type: "polygon",
        latlngs: []
      }
    };*/

  }
};
