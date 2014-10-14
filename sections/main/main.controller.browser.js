/* jslint node: true */
/* global alert,FileReader,angular, window*/
'use strict';
var __ = require('underscore')._,
    utils = require('../_common/utils');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope', '$log', '$upload', '$timeout','Base64'];
  function main ( scope, log, upload, timeout, Base64 ) {
    scope.status = 'portals';

    scope.pathsCoords = [];
    scope.links = [];
    scope.paths = [];
    scope.creationForm =false;
    scope.linkIn = {};
    scope.linkOut = {};
    scope.steps = [];
    scope.controlFields = [   ];
    var cfMonkeyFace = [];
    var linksMonkeyFace = [];
    var uniquesLinks=[];
    var portalMonkeyFace = [];
    var counts;
    var matrix;
    var countSimulate;
    var portalsSimulate;
    var linksSimulate;

    scope.portals = [];
    scope.hideNewportal = 'true';
    scope.newPortal = {};
    scope.marker = {
          id:0,
          coords: {
              latitude: scope.newPortal.latitude,
              longitude: scope.newPortal.longitude
          },
          icon:  '/images/symbol_infinite.png',
          options: { draggable: true },
          events: {
              dragend: function (marker, eventName, args) {
                scope.newPortal.latitude = marker.getPosition().lat();
                scope.newPortal.longitude = marker.getPosition().lng();
                  log.log('marker dragend');
                  log.log(marker.getPosition().lat());
                  log.log(marker.getPosition().lng());
                  scope.$apply();
              }
          }
      };

    scope.$watch( 'newPortal', function  () {
      scope.marker.coords.latitude = scope.newPortal.latitude;
      scope.marker.coords.longitude = scope.newPortal.longitude;
    },true);


    scope.addPortal = function () {
      scope.hideNewportal = 'false';
      scope.newPortal.latitude = scope.map.center.latitude;
      scope.newPortal.longitude = scope.map.center.longitude;
      scope.marker.coords.latitude = scope.newPortal.latitude;
      scope.marker.coords.longitude = scope.newPortal.longitude;
    };

    scope.saveNewPortal = function  () {
      scope.newPortal.id = scope.newPortal.latitude + ' ' + scope.newPortal.longitude;
      var portalMarker = {
        id:scope.newPortal.id,
        options: {
          draggable: false,
          labelAnchor: '10 39',
          labelContent: 'Monkeyface',
          labelClass: 'labelMarker'
        },
        latitude: scope.newPortal.latitude,
        longitude: scope.newPortal.longitude,
        title: scope.newPortal.name
      };
      scope.portals.push( portalMarker);

      var stepActivatePortal = {
        description : 'Activar ' + scope.newPortal.name,
        order : 1,
        type : 'portal',
        name: scope.newPortal.name,
        portal: portalMarker
      };

      scope.steps.push( stepActivatePortal );
      scope.newPortal = {};
      scope.hideNewportal = 'true';
    };

    scope.onFileSelect = function (files) {
      var reader = new FileReader();
      reader.readAsBinaryString(files[0]);

      reader.addEventListener('load', function (x) {
        var i, fileContent;

        fileContent = x.target.result;
        scope.csvPreview = utils.csvToArray(fileContent, 'utf-8');
        scope.csvPreview.splice(0,1);
        __.map( scope.csvPreview, function  ( portal ) {
          var portalMarker = {
            id:portal[2] + ' ' + portal[3],
            options: {
              draggable: false,
              labelAnchor: '10 39',
              labelContent: 'Monkeyface',
              labelClass: 'labelMarker'
            },
            latitude: portal[2],
            longitude: portal[3],
            title: portal[1]
          };
          scope.portals.push( portalMarker);

          var stepActivatePortal = {
            description : 'Activar ' + portal[1],
            order : parseInt( portal[0],10),
            type : 'portal',
            name: portal[1],
            portal: portalMarker
          };

          scope.steps.push( stepActivatePortal );

        });
        scope.map.center.latitude =scope.portals[1].latitude;
        scope.map.center.longitude =scope.portals[0].longitude;
        scope.$apply();
      });
    };

    scope.deletePortal = function ( index ) {
      scope.portals.splice( index, 1 );
    };
    scope.deleteLink = function ( index ) {
      scope.links.splice( index, 1 );
    };
    scope.addLink = function () {
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

      var stepActivatePortal = {
        description : 'Link ' + scope.linkOut.title + ' a ' + scope.linkIn.title,
        order : scope.steps[ scope.steps.length - 1 ].order + 1,
        type : 'link',
        linkOut: scope.linkOut.title,
        linkIn: scope.linkIn.title,
        link: newLink
      };
      scope.links.push(newLink);
      scope.linkIn = {};
      scope.linkOut = {};

      scope.steps.push( stepActivatePortal );
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

    scope.stepsInSteps = function  () {
    };


    scope.simulate = function  () {
      matrix = __.sortBy( scope.steps, function  ( steps ) {
        return steps.order;
      });

      portalsSimulate = angular.copy(scope.portals);
      linksSimulate = angular.copy(scope.links);
      scope.portals = [];
      scope.links = [];
      scope.controlFields = [];
      cfMonkeyFace = [];
      linksMonkeyFace =[];

      countSimulate = 0;
      timeout(Simulation, 800);
    };

    var Simulation = function() {

      if(matrix[countSimulate].type === 'portal'){
        scope.portals.push( matrix[countSimulate].portal);
      }
      if(matrix[countSimulate].type === 'link'){
        scope.links.push( matrix[countSimulate].link);
      }

      var flag;
      var flaglucas;
      var flaglucas2;

      if( matrix[countSimulate].type === 'portal' ){
        portalMonkeyFace.push( matrix[countSimulate].name );
      }
      else if ( matrix[countSimulate].type === 'link' ){
        counts = 0;

        __.map( linksMonkeyFace, function  ( links ) {
          flag = false;
          if( links.length < 3) {
            if( links.length === 1) {
              if( links[0][0] === matrix[countSimulate].linkIn ){
                links.push([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
                flag = true;
                flaglucas = links[0][1];
                flaglucas2 = matrix[countSimulate].linkOut;
              }
              else if ( links[0][1] === matrix[countSimulate].linkIn ){
                links.push([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
                flag = true;
                flaglucas = links[0][0];
                flaglucas2 = matrix[countSimulate].linkOut;
              }
              else if ( links[0][0] === matrix[countSimulate].linkOut ){
                links.push([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
                flag = true;
                flaglucas = links[0][1];
                flaglucas2 = matrix[countSimulate].linkIn;
              }
              else if ( links[0][1] === matrix[countSimulate].linkOut ){
                links.push([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
                flag = true;
                flaglucas = links[0][0];
                flaglucas2 = matrix[countSimulate].linkIn;
              }
              if(flag){
                __.map( uniquesLinks, function  ( lin ) {
                  if( flaglucas === lin[0] || flaglucas === lin[1] ){
                    if( flaglucas2 === lin[0] || flaglucas2 === lin[1]  ){
                      links.push([lin[1],lin[0]]);
                      pushportal([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut],links[0]);
                    }
                  }
                });
              }
            }

            else {
              if( links[0][0] === matrix[countSimulate].linkIn || links[0][1] === matrix[countSimulate].linkIn || links[1][0] === matrix[countSimulate].linkIn || links[1][1] === matrix[countSimulate].linkIn ){
                if( links[0][0] === matrix[countSimulate].linkOut || links[0][1] === matrix[countSimulate].linkOut || links[1][0] === matrix[countSimulate].linkOut || links[1][1] === matrix[countSimulate].linkOut ){
                  links.push([matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
                  pushportal(links[0],links[1]);

                }
              }
            }

          }

          });

          if( counts > 2) {

          }
          uniquesLinks.push( [matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]);
          linksMonkeyFace.push( [[matrix[countSimulate].linkIn,matrix[countSimulate].linkOut]]);
      }
      countSimulate++;
      console.log('llllllll');
      console.log(cfMonkeyFace);
      console.log(linksMonkeyFace);
      timeout(Simulation, 800);
    };


    var pushportal = function  (link1,link2) {

      var cf = [];
      var flag;
      cf.push(link1[0],link1[1]);
      if( link2[0] === link1[0] || link2[0] === link1[1] ){
        cf.push( link2[1]);
      }
      else{
        cf.push( link2[0]);
      }
      flag=false;
      __.map( cfMonkeyFace , function  ( fields ) {
        if( cf[0] === fields [0] || cf[0] === fields [1] || cf[0] === fields [2]  ) {
          if( cf[1] === fields [0] || cf[1] === fields [1] || cf[1] === fields [2]  ) {
            if( cf[2] === fields [0] || cf[2] === fields [1] || cf[2] === fields [2]  ) {
              flag = true;
            }
          }
        }
      });

      if(!flag){
        cfMonkeyFace.push(cf);
        counts++;
        var pinkpanter = {
            id: cfMonkeyFace.length +1,
            path: [
                {
                    latitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[0] === portal.title;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[0] === portal.title;
                    }).longitude
                },
                {
                    latitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[1] === portal.title;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[1] === portal.title;
                    }).longitude
                },
                {
                    latitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[2] === portal.title;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[2] === portal.title;
                    }).longitude
                }
            ],
            stroke: {
                color: '#6060FB',
                weight: 2
            },
            editable: false,
            draggable: false,
            geodesic: true,
            visible: true,
            fill: {
                color: '#6060FB',
                opacity: 0.6
            }
        };
        scope.controlFields.push(pinkpanter);
      }

      return;
    };

    scope.getPortals = function () {
      return scope.portals.map( function ( portal ) {
        return portal.message;
      });
    };

    scope.CSVData = "First, &Last, Middle\n" +
    "Senior,'lu,;ol &Tervor',& M\n" +
    "Smith, &John,& D";


    scope.downloadCSV = function() {
    var data = Base64.encode(scope.CSVData);
    window.location.href = "data:text/csv;base64," + data;
  };
  }
};
