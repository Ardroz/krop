/* jslint node: true */
/* global alert,FileReader,angular */
'use strict';
var __ = require('underscore')._,
    utils = require('../_common/utils');

module.exports = function ( angular, app ) {
  app.controller( 'Main', main );

  main.$inject = [ '$scope', '$log', '$upload', '$timeout'];
  function main ( scope, log, upload, timeout ) {
    scope.status = 'portals';
    scope.pathsCoords = [];
    scope.links = [];
    scope.paths = [];
    scope.creationForm =false;
    scope.linkIn = {};
    scope.linkOut = {};
    scope.steps = [];
    var cfMonkeyFace = [];
    var linksMonkeyFace = [];
    var uniquesLinks=[];
    var portalMonkeyFace = [];
    var counts;
    var matrix;
    var countSimulate;



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

          var stepActivatePortal = {
            description : 'Activar ' + portal[1],
            order : parseInt( portal[0],10),
            type : 'portal',
            name: portal[1],
            portal: portalMarker
          };

          scope.steps.push( stepActivatePortal );

        });
        scope.map.center.latitude = scope.portals[1].latitude;
        scope.map.center.longitude =  scope.portals[1].longitude;
        scope.$apply();
      });
    };

    scope.stepsInSteps = function  () {
    };


    scope.simulate = function  () {
      matrix = __.sortBy( scope.steps, function  ( step ) {
        return step.order;
      });

      var flag;
      var flaglucas;
      var flaglucas2;

      __.map( matrix, function  (step) {
        if( step.type === 'portal' ){
          portalMonkeyFace.push( step.name );
        }
        else if ( step.type === 'link' ){
          counts = 0;

          __.map( linksMonkeyFace, function  ( links ) {
            flag = false;
            if( links.length < 3) {
              if( links.length === 1) {
                if( links[0][0] === step.linkIn ){
                  links.push([step.linkIn,step.linkOut]);
                  flag = true;
                  flaglucas = links[0][1];
                  flaglucas2 = step.linkOut;
                }
                else if ( links[0][1] === step.linkIn ){
                  links.push([step.linkIn,step.linkOut]);
                  flag = true;
                  flaglucas = links[0][0];
                  flaglucas2 = step.linkOut;
                }
                else if ( links[0][0] === step.linkOut ){
                  links.push([step.linkIn,step.linkOut]);
                  flag = true;
                  flaglucas = links[0][1];
                  flaglucas2 = step.linkIn;
                }
                else if ( links[0][1] === step.linkOut ){
                  links.push([step.linkIn,step.linkOut]);
                  flag = true;
                  flaglucas = links[0][0];
                  flaglucas2 = step.linkIn;
                }
                if(flag){
                  __.map( uniquesLinks, function  ( lin ) {
                    if( flaglucas === lin[0] || flaglucas === lin[1] ){
                      if( flaglucas2 === lin[0] || flaglucas2 === lin[1]  ){
                        links.push([lin[1],lin[0]]);
                        pushportal([step.linkIn,step.linkOut],links[0]);
                      }
                    }
                  });
                }
              }

              else {
                if( links[0][0] === step.linkIn || links[0][1] === step.linkIn || links[1][0] === step.linkIn || links[1][1] === step.linkIn ){
                  if( links[0][0] === step.linkOut || links[0][1] === step.linkOut || links[1][0] === step.linkOut || links[1][1] === step.linkOut ){
                    links.push([step.linkIn,step.linkOut]);
                    pushportal(links[0],links[1]);

                  }
                }
              }

            }

          });

          if( counts > 2) {

          }
          uniquesLinks.push( [step.linkIn,step.linkOut]);
          linksMonkeyFace.push( [[step.linkIn,step.linkOut]]);
        }
      });
      console.log('//');
      console.log(linksMonkeyFace);
      console.log(cfMonkeyFace);
      var portalsSimulate = angular.copy(scope.portals);
      var linksSimulate = angular.copy(scope.links);
      scope.portals = [];
      scope.links = [];

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
      countSimulate++;
      timeout(Simulation, 800);
    };


    var pushportal = function  (link1,link2) {
      console.log('lucaskkkkk');
      console.log(link1);
      console.log(link2);
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
      }

      return;
    };

    scope.getPortals = function () {
      return scope.portals.map( function ( portal ) {
        return portal.message;
      });
    };
  }
};
