/* jslint node: true */
/* global alert,FileReader */
'use strict';
var __ = require('underscore')._,
    utils = require('../_common/utils');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope', '$log', '$upload'];
  function main ( scope, log, upload ) {
    scope.status = 'portals';
    scope.pathsCoords = [];
    scope.links = [];
    scope.paths = [];
    scope.creationForm =false;
    scope.linkIn = {};
    scope.linkOut = {};



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
    scope.deleteLink = function ( index ) {
      scope.links.splice( index, 1 );
    };
    scope.addLink = function () {
      console.log('Lolololo');
      console.log(scope.linkIn);
      console.log(scope.linkOut);
      var newLink = {
        nameLinkOut: scope.linkOut.title,
        nameLinkIn: scope.linkIn.title,
          id: scope.links[scope.links.length] ? scope.links[scope.links.length].id + 1:1 ,
          path: [
              {
                  latitude: scope.linkIn.latitude,
                  longitude: scope.linkIn.longitude
              },
              {
                  latitude: scope.linkOut.latitude,
                  longitude: scope.linkOut.longitude
              }
          ],
          stroke: {
              color: '#6060FB',
              weight: 3
          },
          editable: false,
          draggable: false,
          geodesic: true,
          visible: true
      };
      scope.links.push(newLink);
      scope.linkIn = {};
      scope.linkOut = {};
      console.log('lolllllll');
      scope.$apply();
    };

    scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 13
    };

    scope.portalsEvents = {
          click: function (gMarker, eventName, model) {
            if(model.$id){
              model = model.coords;//use scope portion then
            }
            if( scope.creationForm ){
              console.log( scope.linkOut);
              if( !scope.linkOut.title ){
                scope.linkOut = model;
                scope.$apply();
              } else {
                scope.linkIn = model;
                scope.$apply();
                scope.addLink();
              }
            } else {
              alert("Model: event:" + eventName + " " + JSON.stringify(model));
            }

          }
        };


    scope.portals = [];

    scope.invert = function ( link ) {
      var toluca;
      toluca = link.nameLinkOut;
      link.nameLinkOut = link.nameLinkIn;
      link.nameLinkIn = toluca;
    };


    //Troubles getting the portal selected
    scope.onFileSelect = function (files) {
      var reader = new FileReader();
      reader.readAsBinaryString(files[0]);

      reader.addEventListener('load', function (x) {
        var i, fileContent;

        fileContent = x.target.result;
        scope.csvPreview = utils.csvToArray(fileContent, 'utf-8');
        console.log( scope.csvPreview );
        scope.csvPreview.splice(0,1);
        __.map( scope.csvPreview, function  ( portal ) {
          var portalMarker = {
            id:portal[0],
            options: {
              draggable: false,
              labelAnchor: '10 39',
              labelContent: 'hola',
              labelClass: 'labelMarker'
            },
            latitude: portal[2],
            longitude: portal[3],
            title: portal[1]
          };
          scope.portals.push( portalMarker);

        });
        scope.map.center.latitude = scope.portals[1].latitude;
        scope.map.center.longitude =  scope.portals[1].longitude;
        scope.$apply();
      });
    };


    scope.getPortals = function () {
      return scope.portals.map( function ( portal ) {
        return portal.message;
      });
    };
  }
};
