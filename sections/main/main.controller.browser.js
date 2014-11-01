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
    scope.controlFields = [];
    scope.portals = [];
    scope.linkOut = {};
    scope.linkIn = {};
    scope.selectedIndex = 0;
    scope.cardEdit = [];

    var cfMonkeyFace = [],
      counts,
      countSimulate,
      idLink = 0,
      idOrder = 0,
      linksMonkeyFace = [],
      linksSimulate,
      matrix,
      portalMonkeyFace = [],
      portalsSimulate,
      timeoutPromise,
      uniquesLinks=[];

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

    ///////////////////////
    //Map initialization //
    ///////////////////////

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
            if( scope.linkOut !== model){
              scope.linkIn = model;
              scope.$apply();
              scope.addLink();
            }
          }
        } else {
          alert("Model: event:" + eventName + " " + JSON.stringify(model));
        }
      },
    };

    scope.$watch( 'newPortal', function  () {
      scope.marker.coords.latitude = scope.newPortal.latitude;
      scope.marker.coords.longitude = scope.newPortal.longitude;
    },true);

    ////////////////////
    // Portals Section //
    ////////////////////


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
            title: portal[1],
            icon:  '/images/symbol_infinite.png'
          };
          scope.portals.push( portalMarker);
        });
        scope.map.center.latitude =scope.portals[1].latitude;
        scope.map.center.longitude =scope.portals[0].longitude;
        scope.$apply();
      });
    };

    scope.deletePortal = function ( index ) {
      scope.portals.splice( index, 1 );
    };

    scope.overPortal = function  ( id ) {
      __.find( scope.portals , function  ( portal ) {
        return portal.id == id;
      }).icon = '/images/blue_marker.png';
    };

    scope.leavePortal = function  ( id ) {
      __.find( scope.portals , function  ( portal ) {
        return portal.id == id;
      }).icon = '/images/symbol_infinite.png';
    };

    scope.editPortal = function  ( index ) {
      scope.cardEdit[index] = !scope.cardEdit[index];
    };

    ///////////////////
    // Links Section //
    ///////////////////

    scope.deleteLink = function ( index ) {
      scope.links.splice( index, 1 );
    };

    scope.addLink = function () {
      var newLink = {
        nameLinkOut: scope.linkOut.title,
        nameLinkIn: scope.linkIn.title,
        id: idLink ,
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

      var stepMakeLink = {
        description : 'Link ' + scope.linkOut.title + ' a ' + scope.linkIn.title,
        order : idOrder,
        type : 'link',
        linkOut: scope.linkOut,
        linkIn: scope.linkIn,
        link: newLink
      };

      scope.links.push(newLink);
      idLink++;
      scope.linkIn = {};
      scope.linkOut = {};
      scope.steps.push( stepMakeLink );
      idOrder++;
      scope.$apply();

    };

    scope.invert = function ( link ) {
      var toluca;
      toluca = link.nameLinkOut;
      link.nameLinkOut = link.nameLinkIn;
      link.nameLinkIn = toluca;
    };


    ///////////////
    //Simulation //
    ///////////////

    scope.stopSimulate = function  () {
      scope.portals = portalsSimulate;
      scope.links = linksSimulate;
      timeout.cancel( timeoutPromise );
    };

    scope.simulateInitialization = function  () {
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
      uniquesLinks = [];
      portalMonkeyFace = [];
      countSimulate = 0;
      timeoutPromise = timeout(simulation, 800);
    };

    var simulation = function() {


      var flag,
        flaglucas,
        flaglucas2,
        portalRep1,
        portalRep2;

      if( matrix[countSimulate].type === 'portal' ){
        scope.portals.push( matrix[countSimulate].portal);
        portalMonkeyFace.push( matrix[countSimulate].name );
      }
      else if ( matrix[countSimulate].type === 'link' ){

        console.log(matrix[countSimulate]);

        var activePortalIn = __.find( portalMonkeyFace , function ( portal ) {
          return portal.id === matrix[countSimulate].linkIn.id;
        });

        var activePortalOut = __.find( portalMonkeyFace , function ( portal ) {
          return portal.id === matrix[countSimulate].linkOut.id;
        });

        if( activePortalIn ) {
          if( activePortalOut ){

          } else {
            scope.portals.push( matrix[countSimulate].linkOut );
            portalMonkeyFace.push( matrix[countSimulate].linkOut );
          }

          scope.links.push( matrix[countSimulate].link);
          counts = 0;

          __.map( uniquesLinks, function  ( links ) {
            if(
              links[0] === matrix[countSimulate].linkIn.id ||
              links[1] === matrix[countSimulate].linkIn.id ||
              links[0] === matrix[countSimulate].linkOut.id ||
              links[1] === matrix[countSimulate].linkOut.id
            ){
              if(__.contains( [matrix[countSimulate].linkIn.id, matrix[countSimulate].linkOut.id], links[0])) {
                portalRep1 =links[0];
                flaglucas = links[1];
                if(__.contains( [ links[0],links[1]], matrix[countSimulate].linkIn.id)) {
                  flaglucas2 = matrix[countSimulate].linkOut.id;
                  portalRep2 = matrix[countSimulate].linkIn.id;
                } else {
                  portalRep2 = matrix[countSimulate].linkOut.id;
                  flaglucas2 = matrix[countSimulate].linkIn.id;
                }
              } else {
                portalRep1 =links[1];
                flaglucas = links[0];
                if(__.contains( [ links[0],links[1]], matrix[countSimulate].linkIn.id)) {
                  flaglucas2 = matrix[countSimulate].linkOut.id;
                  portalRep2 = matrix[countSimulate].linkIn.id;
                } else {
                  portalRep2 = matrix[countSimulate].linkOut.id;
                  flaglucas2 = matrix[countSimulate].linkIn.id;
                }
              }
              flag = false;
              __.map( uniquesLinks, function  ( lin ) {
                if( flaglucas === lin[0] || flaglucas === lin[1] ){
                  if( flaglucas2 === lin[0] || flaglucas2 === lin[1]  ){
                    flag = true;
                  }
                }
              });
              if( flag ) {
                linksMonkeyFace.push(
                  [
                    [links[0],links[1]],
                    [matrix[countSimulate].linkIn.id, matrix[countSimulate].linkOut.id],
                    [portalRep1,portalRep2]
                  ]
                );
                pushControlField(
                  [links[0],links[1]],
                  [matrix[countSimulate].linkIn.id, matrix[countSimulate].linkOut.id]
                );
              } else {
                linksMonkeyFace.push(
                  [
                    [links[0],links[1]],
                    [ matrix[countSimulate].linkIn.id , matrix[countSimulate].linkOut.id ]
                  ]
                );
              }
            }
          });
          __.map( linksMonkeyFace, function  ( links ) {
            if ( links.length === 2 ){
              if(__.contains( [links[0][0],links[0][1]], links[1][0])) {
                portalRep1 = links[1][0];
                flaglucas = links[1][1];
                if( __.contains( [links[1][0],links[1][1]], links[0][0]) ) {
                  flaglucas2 = links[0][1];
                  portalRep2 = links[0][0];
                } else {
                  portalRep2 = links[0][1];
                  flaglucas2 = links[0][0];
                }
              } else {
                portalRep1 = links[1][1];
                flaglucas = links[1][0];
                if( __.contains( [links[1][0],links[1][1]], links[0][0]) ) {
                  flaglucas2 = links[0][1];
                  portalRep2 = links[0][0];
                } else {
                  portalRep2 = links[0][1];
                  flaglucas2 = links[0][0];
                }
              }
              flag = false;
              __.map( uniquesLinks, function  ( lin ) {
                if( flaglucas === lin[0] || flaglucas === lin[1] ){
                  if( flaglucas2 === lin[0] || flaglucas2 === lin[1]  ){
                    flag = true;
                  }
                }
              });

              if( flag ) {
                links.push( [flaglucas,flaglucas2] );
                pushControlField( links[0],links[1] );
              }
            }
          });
          uniquesLinks.push( [matrix[countSimulate].linkIn.id,matrix[countSimulate].linkOut.id]);

        } else {
          scope.portals.push( matrix[countSimulate].linkIn );
          portalMonkeyFace.push( matrix[countSimulate].linkIn );
          var stepActivatePortal = {
            description : 'Activar ' + matrix[countSimulate].linkIn.title,
            order : countSimulate,
            type : 'portal',
            portal: matrix[countSimulate.linkIn]
          };
          matrix = __.map( matrix, function  ( step ) {
            if( step.order >= countSimulate){
              step.order = step.order +1;
            }
            return step;
          });
          matrix.push( stepActivatePortal );
          matrix = __.sortBy( matrix, function  ( steps ) {
            return steps.order;
          });

        }
      }
      countSimulate++;





      if( matrix.length !== countSimulate ){
        timeoutPromise = timeout(simulation, 800);
      }
    };

    //This function is used to go adding CF within the simulation
    var pushControlField = function  (link1,link2) {

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
                      return cf[0] === portal.id;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[0] === portal.id;
                    }).longitude
                },
                {
                    latitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[1] === portal.id;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[1] === portal.id;
                    }).longitude
                },
                {
                    latitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[2] === portal.id;
                    }).latitude,
                    longitude: __.find( portalsSimulate, function  ( portal ) {
                      return cf[2] === portal.id;
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

    /////////////////////
    // Create document //
    /////////////////////

    scope.CSVData = "ID&Nombre&lat&long&link&nameLinkOut&nameLinkIn&lat1&long1&lat2&long2/n" +
    "First, &Last, Middle\n" +
    "Senior,'lu,;ol &Tervor',& M\n" +
    "Smith, &John,& D";

    scope.generateDocument = function  () {
      var lu = JSON.stringify( scope.links );



      lu =JSON.parse(lu);



    };

    scope.downloadCSV = function() {
    var data = Base64.encode(scope.CSVData);
    window.location.href = "data:text/csv;base64," + data;
  };
  }
};
